// test-submit.js
// Simple script to discover a country/state/city and POST a test employee
// Requires Node 18+ for global fetch

const base = process.env.API_BASE || 'http://127.0.0.1:3000';

async function main(){
  try{
    console.log('Using base URL:', base);
    const countriesRes = await fetch(`${base}/api/v1/apply/countries`);
    const countriesJson = await countriesRes.json();
    const countries = countriesJson.data || [];
    if(!countries.length) return console.error('No countries found');
    const country = countries[0];
    console.log('Picked country:', country.country_name, country.country_code, country.country_id);

    const statesRes = await fetch(`${base}/api/v1/apply/states/${country.country_code}`);
    const statesJson = await statesRes.json();
    const states = statesJson.data || [];
    if(!states.length) return console.error('No states for country', country.country_code);
    let state = null;
    let city = null;
    for (const s of states) {
      const citiesRes = await fetch(`${base}/api/v1/apply/cities/${s.state_id}`);
      const citiesJson = await citiesRes.json();
      const cities = citiesJson.data || [];
      if (cities && cities.length) {
        state = s;
        city = cities[0];
        break;
      }
    }

    if (!state) return console.error('No states with cities found for country', country.country_code);
    console.log('Picked state:', state.state_name, state.state_id);
    console.log('Picked city:', city.city_name, city.city_id);

    const payload = {
      first_name: 'Test',
      middle_name: 'T',
      last_name: 'User',
      birth_date: '1990-01-01',
      linkedin_url: 'https://www.linkedin.com/in/test',
      personal_email: `test.user+${Date.now()}@example.com`,
      phone: '1234567890',
      phonetype: 'Mobile',
      address_line_1: '123 Test St',
      address_line_2: null,
      city_id: city.city_id,
      state_id: state.state_id,
      zip_code: '12345',
      country_id: country.country_id,
      homecountry_id: country.country_code, // validation expects 2-letter uppercase code for homecountry_id in some places; controller expects numeric — include both above mapping
      time_zone: 'EST',
      educations: [{ institution_name: 'Test Univ', degree: 'BS', major: 'CS', start_date: '2010-01-01' }],
      employments: [],
      gender: 'Male',
      opt_support: 'No',
      start_date: '2024-01-01',
      hours_commitment: 10,
      why_kworks: 'Testing',
      visa_status: 'Citizen',
      additional_websites: null,
      additional_info: null,
      sexual_orientation: 'Prefer not to say',
      disability: 'No',
      linkedin_url: 'https://www.linkedin.com/in/test'
    };

    console.log('Posting payload...');
    const postRes = await fetch(`${base}/api/v1/apply/employees`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    const text = await postRes.text();
    console.log('Response status:', postRes.status);
    console.log('Response body:', text);
  }catch(err){
    console.error('Test submit failed:', err);
  }
}

main();
