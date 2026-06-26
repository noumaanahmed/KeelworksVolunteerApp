import countryModel from "../models/countryModel.js";
import stateModel from "../models/stateModel.js";
import cityModel from "../models/cityModel.js";
import validations from "../validators/legacy.validation.js";
const getAllCountries = async() =>{
    let query = {
        attributes:['country_id', 'country_name', 'country_code']
      }
    let countries = await countryModel.findAll(query);
    return countries;
}

const getAllCities = async(state_id)=>{
    let query = {
        where:{
            state_id: state_id
        }
    };
    let cities = await cityModel.findAll(query);
    return cities;
}

const getAllStates = async(country_code) =>{
    // Find the country_id for the given country_code
    const country = await countryModel.findOne({
        where: { country_code: country_code }
    });
    if (!country) {
        return [];
    }
    let query = {
        where:{
            country_id: country.country_id,
        }
    };
    let states = await stateModel.findAll(query);
    return states;
}

const getAllCountryPhoneCodes = async()=>{
    let query = {
        attributes:['country_id', 'country_name', 'country_code_phone']
      }
      let countryPhoneCodes = await countryModel.findAll(query);
      return countryPhoneCodes;
}

const cityExist = async(city_id)=>{
    validations.validatePrimaryId(city_id, "City id");
    let query = {
        where:{
        city_id: city_id
        }
    };
    let city = await cityModel.findOne(query);
    if(city === null){
        throw `City not found. Please provide valid ID`
    }
    return true;
}
const stateExist = async(state_id)=>{
    validations.validatePrimaryId(state_id, "State id");

    let query = {
        where:{
        state_id: state_id
        }
    };
    let state = await stateModel.findOne(query);
    if(state === null){
        throw `state not found. Please provide valid ID`
    }
    return true;
}


const countryExist = async(country_id)=>{
    validations.validatePrimaryId(country_id, "country");
    let query = {
        where:{
            country_id: country_id
        }
    };
    let country = await countryModel.findOne(query);
    if(country === null){
        throw `Country not found. Please provide valid ID`
    }
    return true;
}

const createCity = async(state_id, city_name) => {
    if (!state_id || !city_name || String(city_name).trim().length === 0) {
        throw `state_id and city_name are required`;
    }

    // ensure state exists
    await stateExist(state_id);

    const trimmed = String(city_name).trim();
    // check for existing city (unique constraint on city_name + state_id)
    let existing = await cityModel.findOne({ where: { city_name: trimmed, state_id } });
    if (existing) return existing;

    // create new city
    const created = await cityModel.create({ city_name: trimmed, state_id });
    return created;
}



const dataFunctions = {
    getAllCountries,
    getAllCities,
    getAllStates,
    getAllCountryPhoneCodes,
    cityExist,
    stateExist,
    countryExist,
    createCity
}

export default dataFunctions;


