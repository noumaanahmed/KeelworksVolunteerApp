const base = process.env.API_BASE || 'http://127.0.0.1:3000';
const payload = { state_id: 5, city_name: `Testville_${Date.now()}` };

async function post(path){
  try{
    const res = await fetch(`${base}${path}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    const text = await res.text();
    console.log(path, res.status, text);
  }catch(err){
    console.error(path, 'error', err.message);
  }
}

(async ()=>{
  await post('/api/v1/apply/cities');
  await post('/api/v1/apply/cities/');
  await post('/api/v1/apply/Cities');
  await post('/api/v1/apply/CITIES');
})();
