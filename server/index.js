import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const menu=JSON.parse(readFileSync(resolve(root,'data/menu.json'),'utf8'));
const dbPath=process.env.DB_PATH||resolve(root,'var/orders.sqlite');mkdirSync(dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)');
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
function validate(payload){
 if(!payload||typeof payload!=='object')throw Error('Invalid order.');
 if(!['Delivery','Pickup'].includes(payload.mode))throw Error('Choose delivery or pickup.');
 const customer=payload.customer;
 if(!customer||typeof customer.name!=='string'||customer.name.trim().length<2||customer.name.length>80)throw Error('Enter your name (2–80 characters).');
 if(typeof customer.phone!=='string'||!/^\+?[\d ()-]{7,20}$/.test(customer.phone))throw Error('Enter a valid phone number.');
 if(payload.mode==='Delivery'&&(typeof customer.address!=='string'||customer.address.trim().length<8||customer.address.length>400))throw Error('Enter your delivery address (8–400 characters).');
 if(typeof payload.requestKey!=='string'||! /^[a-zA-Z0-9-]{16,64}$/.test(payload.requestKey))throw Error('Invalid request identifier.');
 if(!Array.isArray(payload.items)||!payload.items.length||payload.items.length>menu.products.length)throw Error('Your bucket is empty or invalid.');
 const seen=new Set();const items=payload.items.map(item=>{const p=menu.products.find(p=>p.id===item.productId);if(!p||seen.has(p.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20)throw Error('Invalid item or quantity.');seen.add(p.id);return {productId:p.id,name:p.name,unitPrice:p.price,quantity:item.quantity,subtotal:p.price*item.quantity};});
 const subtotal=items.reduce((n,i)=>n+i.subtotal,0);const deliveryFee=payload.mode==='Delivery'?150:0;
 return {id:randomUUID(),createdAt:new Date().toISOString(),status:'received',currency:'PKR',mode:payload.mode,paymentMethod:'cash',customer:{name:customer.name.trim(),phone:customer.phone.trim(),address:payload.mode==='Delivery'?customer.address.trim():''},items,subtotal,deliveryFee,total:subtotal+deliveryFee};
}
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.json':'application/json','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 try{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{status:'ok'});
 if(req.method==='GET'&&url.pathname==='/api/menu')return json(res,200,menu);
 if(req.method==='POST'&&url.pathname==='/api/orders'){
  if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)return json(res,403,{error:'Cross-origin requests are not permitted.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'Use application/json.'});
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16384)return json(res,413,{error:'Order is too large.'});}
  let payload;try{payload=JSON.parse(body);}catch{return json(res,400,{error:'Invalid JSON.'});}
  let order;try{order=validate(payload);}catch(e){return json(res,400,{error:e.message});}
  const existing=db.prepare('SELECT body FROM orders WHERE request_key = ?').get(payload.requestKey);
  if(existing)return json(res,200,JSON.parse(existing.body));
  db.prepare('INSERT INTO orders (id, request_key, body, created_at) VALUES (?, ?, ?, ?)').run(order.id,payload.requestKey,JSON.stringify(order),order.createdAt);
  return json(res,201,order);
 }
 if(url.pathname.startsWith('/api/'))return json(res,404,{error:'Not found.'});
 if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed.'});
 const dist=resolve(root,'dist');const path=resolve(dist,'.'+decodeURIComponent(url.pathname));
 if(path!==dist&&!path.startsWith(dist+'/'))return json(res,403,{error:'Forbidden.'});
 const file=url.pathname==='/'?resolve(dist,'index.html'):path;
 if(!existsSync(file))return json(res,404,{error:'Not found. Run npm run build before npm start.'});
 let contents;try{contents=readFileSync(file);}catch{return json(res,404,{error:'Not found.'});}
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:contents);
 }catch{json(res,500,{error:'Something went wrong. Please try again.'});}
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log(`Khawja server listening on port ${server.address().port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
