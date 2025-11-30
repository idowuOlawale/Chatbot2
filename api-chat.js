export default async function handler(req,res){
if(req.method!=='POST') return res.status(405).end();
let message;
try {
  const body = await new Promise((resolve,reject)=>{
    let data='';
    req.on('data',chunk=>{data+=chunk});
    req.on('end',()=>resolve(JSON.parse(data)));
    req.on('error',err=>reject(err));
  });
  message = body.message;
} catch(err){
  return res.status(400).json({reply:"Invalid JSON body"});
}
const key=process.env.OPENAI_API_KEY;
if(!key) return res.status(500).json({reply:"API key not set"});
try{
  const r = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+key,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"gpt-4.1-mini",
      messages:[{role:"user",content:message}]
    })
  });
  const data=await r.json();
  res.status(200).json({reply:data.choices?.[0]?.message?.content||"Error"});
}catch(err){
  res.status(500).json({reply:"Server error"});
}
}
