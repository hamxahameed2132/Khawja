import {DatabaseSync} from 'node:sqlite';
import {writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const dbPath=resolve(process.env.DB_PATH||'var/orders.sqlite');
if(!existsSync(dbPath)){console.error('No order database exists yet. Start the site and place an order first.');process.exit(1);}
const output=resolve(process.argv[2]||'var/orders-export.json');
const db=new DatabaseSync(dbPath,{readOnly:true});
const orders=db.prepare('SELECT body FROM orders ORDER BY created_at DESC').all().map(row=>JSON.parse(row.body));
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify({currency:'PKR',exportedAt:new Date().toISOString(),orders},null,2)+'\n',{mode:0o600});db.close();console.log(`Exported ${orders.length} order(s). Keep the export private: it contains customer details.`);
