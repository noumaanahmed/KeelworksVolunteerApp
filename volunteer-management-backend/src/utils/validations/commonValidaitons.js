import validator from "validator";

export const validString =(str, fieldName = "field")=>{
    if(str == undefined){
          throw `${fieldName} must be provided`;
      }
      if (typeof str != "string"){
            throw `${fieldName} must be a string`
      }
      str = validator.trim(str);
      if(str.length== 0){
          throw `${fieldName} can't be empty`;
      }
}

export const validateText = (text, fieldName, maxLength = 1000)=>{
    validString(text, fieldName);
    text = text.trim();
    if(text.length >maxLength || text.length == 0){
        throw `${fieldName} should be between 1 and ${maxLength} characters`;
    }
    // const invalidCharsRegex = /^[a-zA-Z0-9.,!?'"()@&%/\s]*$/;
    // if(invalidCharsRegex.test(text)){
    //     throw `${fieldName} must have valid characters`;
    // }
}

export const validatePrimaryId =(id, fieldName)=>{
    if(typeof id != "number" || Number.isNaN(id)){
        throw `${fieldName} should be a number`;
    }
    if(id<0 || id>10000000){
        throw `${fieldName} should be a valid`;
    }
}

export const notAvaiableString = (val)=>{
    if(val){
        return val.trim();
    }
    return null
}

export const validateDate = (date, fieldName)=>{
    if(date == undefined || typeof date != "string" || validator.toDate(date)== null){
        throw `Please provide valid date with YYYY/MM formart for ${fieldName}`;
    }
}

export const enumValidate = (enumArray, val)=>{
    let found = false;
    for(let i =0; i<enumArray.length; i++){
        if(enumArray[i] == val){
            found= true;
            break;
        }
    } 
    return found;
}