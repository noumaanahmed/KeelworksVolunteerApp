import validator from "validator";
const validateName= (name, fieldName)=>{
    if(name == undefined){
        throw `${fieldName} must be provided`;
    }
    name = validator.trim(name);
    if(name.length== 0){
        throw `${fieldName} can't be empty`;
    }
    if(!validator.isAlpha(name, 'en-US')){
        throw `${fieldName} must only contain alphabets`;
    }
    if(!validator.isLength(name, {max:50})){
        throw  `${fieldName} can not be more than 50 characters`;
    }
}
const validateEmail=(email, fieldName)=>{
    if(email == undefined){
        throw `${fieldName} must be provided`;
    }
    email = validator.trim(email);
    if(email.length== 0){
        throw `${fieldName} can't be empty`;
    }
    if(!validator.isEmail(email)){
        throw `${fieldName} should be a valid Email`;
    }
    if(!validator.isLength(email, {max:255})){
        throw  `${fieldName} can not be more than 255 characters`;
    }
}

const validatePhone =(phone, fieldName)=>{
    if(phone == undefined){
        throw `${fieldName} is required`;
    }   
    phone = validator.trim(phone);
    if(phone.length != 10){
        throw `${fieldName} must be 10 digits`;
    }
    if(!validator.isNumeric(phone)){
        throw `${fieldName} must be only numbers`;
    }
}

const validateURL =(url, regex, fieldName)=>{
    if(url == undefined){
        throw `${fieldName} is required`;
    }   
    url = validator.trim(url);
    if(url.length == 0){
        throw `${fieldName} can't be empty`;
    }
    if(!regex.test(url)){
        throw `${fieldName} must have a valid format`;
    }
}

const validateCountryCodePhone = (countryCodePhone)=>{
    if(countryCodePhone == undefined){
        throw `Phone Country code is needed`;
    }
    countryCodePhone = validator.trim(countryCodePhone);
    const countryCodeRegex = /^\+?[1-9]\d{0,2}$/;
    if(!countryCodeRegex.test(countryCodePhone)){
        throw `Please provide valid country code`;
    }
}

const validateText = (text, fieldName, maxLength = 1000)=>{
    text = text.trim();
    if(text.length >maxLength || text.length == 0){
        throw `${fieldName} should be between 1 and ${maxLength} characters`;
    }
    // const invalidCharsRegex = /^[a-zA-Z0-9.,!?'"()@&%/\s]*$/;
    // if(invalidCharsRegex.test(text)){
    //     throw `${fieldName} must have valid characters`;
    // }
}

const validatePrimaryId =(id, fieldName)=>{
    if(typeof id != "number" || Number.isNaN(id)){
        throw `${fieldName} should be a number`;
    }
    if(id<0 || id>10000000){
        throw `${fieldName} should be a valid`;
    }
}

const validateZipCode =(zipcode)=>{
    if(zipcode == undefined){
        throw `Zipcode is required`;
    }
    zipcode = zipcode.trim();

    if(zipcode.length>6 || !validator.isNumeric(zipcode)){
        throw `Please provide valid zipcode`;
    }
}

const validateDate = (date, fieldName)=>{
    if(date == undefined || validator.toDate(date)== null){
        throw `Please provide valid date with YYYY/MM formart for ${fieldName}`;
    }
}

const personalDetails =(data)=>{
    let {first_name, middle_name, last_name, personal_email, phone, country_code_phone, additional_info, additional_websites, linkedin_url, homecountry_id} = data;
    validateName(first_name, "First name");
    validateName(last_name, "Last name");
    if(middle_name && middle_name.trim().length >0){
        validateName(middle_name, "Middle name");
    }
    validateEmail(personal_email, "Perosal email");
    validatePhone(phone, "Personal phone number");
    validateURL(linkedin_url, /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company|school)\/[a-zA-Z0-9-_/]+\/?$/, "LinkedIn Url");
    validateURL(additional_websites, /^https:\/\/((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,}|localhost)(:\d+)?(\/[^\s]*)?$/, "Additional website");
    validateCountryCodePhone(country_code_phone);
    if(!additional_info && additional_info.trim().length >0){
        validateText(additional_info, "Additonal Info");
    }
    validatePrimaryId(homecountry_id, "home country");
}

const keelWorks = (data)=>{
    let {why_kworks, hours_commitment, desired_start_date} = data;
    validateText(why_kworks, "Why KeelWorks");
    if(typeof hours_commitment != "number" || hours_commitment>168){
        throw `Please provide valid hours commirment.`
    }
    if(desired_start_date == undefined || desired_start_date.trim().length == 0 || validator.toDate(desired_start_date) == null){
        throw `Please provide valid desired start date`;
    }
}

const address =(data)=>{
    let {address_line_1: address1, address_line_2: address2, city_id, zip_code}= data;
    validateText(address1, "Address line 1");
    if(address2 && (address2.trim()).length>0) validateText(address2, "Address line 2");
    validatePrimaryId(city_id, "City id");
    validateZipCode(zip_code);
}
const education = (data)=>{
    let validated = []
    for(let i = 0; i<data.length; i++){
        let {institution_name, degree, major, start_date, end_date} = data[i];
        validateText(institution_name, "Institution name", 50);
        validateText(degree, "Degree", 50);
        validateText(major, "Major", 50 );
        validateDate(start_date, "start date");
        if(end_date && end_date.trim().length != 0){
            validateDate(end_date, "end start");
            if(new Date(start_date) > new Date(end_date)){
                throw `End date should be after start date for ${institution_name}`;
            }
            end_date = end_date.trim();
        }else{
            end_date = null;
        }
        institution_name = institution_name.trim();
        degree = degree.trim();
        major = major.trim();
        start_date = start_date.trim();
        validated.push({institution_name, degree, major, start_date, end_date});
    }
    return validated;
}

const employment = (data)=>{
    let validated = []

    for(let i = 0; i<data.length; i++){
        let {company_name, job_title, location, start_date, end_date, responsibilities} = data[i];
        validateText(company_name, "Company name", 100);
        validateText(job_title, "Job title", 100);
        validateText(location, "Loation", 100 );
        validateText(responsibilities, "Responsibilities");
        validateDate(start_date, "start date");

        if(end_date && end_date.trim().length != 0){
            validateDate(end_date, "end start");
            if(new Date(start_date) > new Date(end_date)){
                throw `End date should be after start date for ${company_name}`;
            }
            end_date = end_date.trim();
        }
        else{
            end_date =null
        }
        company_name = company_name.trim();
        job_title = job_title.trim();
        location = location.trim();
        responsibilities= responsibilities.trim();
        start_date = start_date.trim();
        validated.push( {company_name, job_title, location, start_date, end_date, responsibilities});
    }
    return validated;
}

const enumValidate = (enumArray, val)=>{
    let found = false;
    for(let i =0; i<enumArray.length; i++){
        if(enumArray[i] == val){
            found= true;
            break;
        }
    } 
    return found;
}
const phoneType =(phone)=>{
    const phoneTypeEnum =  ['Mobile', 'Home', 'Work'];
    phone = phone.trim();
    if(!enumValidate(phoneTypeEnum, phone)){
        throw `Phone type should be 'Mobile', 'Home', or 'Work' `;
    }      
    return phone
}

const gender = (gen)=>{
    const genderEnum =  ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
    gen = gen.trim();
    if(!enumValidate(genderEnum, gen)){
        throw `Gender should be 'Male', 'Female', 'Non-binary', or 'Prefer not to say' `;
    }
    return gen
}

const opt_support = (opt)=>{
    const optEnum =  ['Yes, the OPT period has started', 'Yes, approved but have not received the EAD card', 'No'];
    opt = opt.trim();
    if(!enumValidate(optEnum, opt)){
        throw `opt_support should be 'Yes, the OPT period has started', 'Yes, approved but have not received the EAD card', or 'No' `;
    }      
    return opt
}

const visa_status =(visa)=>{
    const visaStatusEnum= ['Citizen', 'Permanent Resident', 'Student Visa', 'Work Visa', 'Other'];
    visa = visa.trim();
    if(!enumValidate(visaStatusEnum, visa)){
        throw `Visa status should be 'Citizen', 'Permanent Resident', 'Student Visa', 'Work Visa', or 'Other' `;
    }      
    return visa
}

const sexual_orientation = (sex)=>{
    const sexEnum= ['Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Prefer not to say'];
    sex = sex.trim();
    if(!enumValidate(sexEnum, sex)){
        throw `Sexual orientation should be 'Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', or 'Prefer not to say' `;
    }      
    return sex
}

const disability =(val)=>{
    const disabilityEnum =['Yes', 'No', 'Prefer not to say'];

    val = val.trim();
    if(!enumValidate(disabilityEnum, val)){
        throw `disability should be 'Yes', 'No', or 'Prefer not to say'`;
    }
    return val
}


const validations = {opt_support, visa_status, sexual_orientation, disability,   personalDetails, address, keelWorks, education, validatePrimaryId, phoneType, gender, validateText, employment };
export default validations;