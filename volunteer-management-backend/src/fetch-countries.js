const base = process.env.API_BASE || 'http://127.0.0.1:3000';

async function main(){
  try{
    const res = await fetch(`${base}/api/v1/apply/countries`);
    const text = await res.text();
    console.log('status', res.status);
    console.log('body', text);
  }catch(err){
    console.error(err);
  }
}

main();
