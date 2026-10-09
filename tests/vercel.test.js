import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import orders from '../api/orders.js';
const temp=mkdtempSync(join(tmpdir(),'khawja-vercel-'));
const original={url:process.env.TURSO_DATABASE_URL,token:process.env.TURSO_AUTH_TOKEN};
after(()=>{if(original.url===undefined)delete process.env.TURSO_DATABASE_URL;else process.env.TURSO_DATABASE_URL=original.url;if(original.token===undefined)delete process.env.TURSO_AUTH_TOKEN;else process.env.TURSO_AUTH_TOKEN=original.token;rmSync(temp,{recursive:true,force:true});});
async function call(body,overrides={}){const req={method:'POST',headers:{host:'khawja.example','content-type':'application/json',origin:'https://khawja.example'},body,...overrides};const result={status:200};const res={setHeader(){},status(code){result.status=code;return this;},json(value){result.body=value;return this;}};await orders(req,res);return result;}
const payload=()=>({requestKey:randomUUID(),mode:'Delivery',customer:{name:'Test Customer',phone:'03001234567',address:'123 Test Street, Test City'},items:[{productId:1,quantity:2}]});
test('serverless checkout reports missing configuration without pretending to accept an order',async()=>{delete process.env.TURSO_DATABASE_URL;delete process.env.TURSO_AUTH_TOKEN;const result=await call(payload());assert.equal(result.status,503);assert.match(result.body.error,/not configured/);});
test('serverless handler rejects cross-origin and invalid items',async()=>{assert.equal((await call(payload(),{headers:{origin:'https://other.example',host:'khawja.example'}})).status,403);assert.equal((await call({...payload(),items:[{productId:999,quantity:1}]})).status,400);});
test('serverless database adapter saves priced orders and deduplicates retries',async()=>{process.env.TURSO_DATABASE_URL='file:'+join(temp,'orders.sqlite');process.env.TURSO_AUTH_TOKEN='local-test-placeholder';const body=payload();const result=await call(body);assert.equal(result.status,201,JSON.stringify(result.body));assert.equal(result.body.total,770);const retry=await call(body);assert.equal(retry.status,200);assert.equal(retry.body.id,result.body.id);});
