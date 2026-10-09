import {createClient} from '@libsql/client';
import {validateOrder} from '../server/order.js';
let client;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
 const origin=req.headers.origin;const host=req.headers.host;
 if(origin&&origin!==`https://${host}`&&origin!==`http://${host}`)return res.status(403).json({error:'Cross-origin requests are not permitted.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return res.status(415).json({error:'Use application/json.'});
 let payload=req.body;
 if(typeof payload==='string'){try{payload=JSON.parse(payload);}catch{return res.status(400).json({error:'Invalid JSON.'});}}
 if(Buffer.byteLength(JSON.stringify(payload??{}))>16384)return res.status(413).json({error:'Order is too large.'});
 let order;try{order=validateOrder(payload);}catch(e){return res.status(400).json({error:e.message});}
 if(!process.env.TURSO_DATABASE_URL||!process.env.TURSO_AUTH_TOKEN)return res.status(503).json({error:'Online ordering is not configured yet. Please try again later.'});
 try{
  client??=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
  await client.execute('CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)');
  const inserted=await client.execute({sql:'INSERT INTO orders (id, request_key, body, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(request_key) DO NOTHING',args:[order.id,payload.requestKey,JSON.stringify(order),order.createdAt]});
  const result=await client.execute({sql:'SELECT body FROM orders WHERE request_key = ?',args:[payload.requestKey]});
  return res.status(inserted.rowsAffected?201:200).json(JSON.parse(result.rows[0].body));
 }catch{return res.status(503).json({error:'Ordering is temporarily unavailable. Your bucket is safe; please retry.'});}
}
