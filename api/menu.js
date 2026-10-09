import menu from '../data/menu.json' with {type:'json'};
export default function handler(req,res){if(req.method!=='GET')return res.status(405).json({error:'Method not allowed.'});res.setHeader('Cache-Control','public, max-age=60');return res.status(200).json(menu);}
