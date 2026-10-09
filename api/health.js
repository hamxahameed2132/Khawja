export default function handler(req,res){return res.status(200).json({status:'ok',orderingConfigured:Boolean(process.env.TURSO_DATABASE_URL&&process.env.TURSO_AUTH_TOKEN)});}
