// create-city-test.js
const base = process.env.API_BASE || 'http://127.0.0.1:3000';

async function main(){
  const payload = { state_id: 5, city_name: `Testville_${Date.now()}` };
  try{
    const res = await fetch(`${base}/api/v1/apply/cities`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('status', res.status);
    console.log('body', text);
  }catch(err){
    console.error(err);
  }
}

main();
