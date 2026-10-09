import {randomUUID} from 'node:crypto';
import menu from '../data/menu.json' with {type:'json'};
export function validateOrder(payload){
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
