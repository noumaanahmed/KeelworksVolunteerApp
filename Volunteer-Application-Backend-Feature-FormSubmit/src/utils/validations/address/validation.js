import { validatePrimaryId, validateText ,validString, notAvaiableString } from "../commonValidaitons.js";
import validator from "validator";

const validateZipCode =(zip_code)=>{
    validString(zip_code, "zip code");
    if(zip_code.trim().length > 12){
        throw `Please provide a valid zipcode`;
    }
}

const address =(data)=>{
    if(data == undefined){
        throw `Address is needed`;
    }
    
    let {address_line_1: address1, address_line_2: address2, city_id, zip_code}= data;
    validateText(address1, "Address line 1");
    address1 = validator.trim(address1);
    if(address2 != undefined && address2 != null && address2.trim().length > 0){
        validateText(address2, "Address line 2");
    } else {
        address2 = undefined;
    }
    //this will trim the string if its avaiable or return null
    address2 = notAvaiableString(address2);
    validatePrimaryId(city_id, "City id");
    validateZipCode(zip_code);
    zip_code = validator.trim(zip_code);
    return {address1, address2, city_id, zip_code};
}

export default address;