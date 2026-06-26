import { validString, validateText, validatePrimaryId, notAvaiableString, enumValidate } from "../commonValidaitons.js";
import validator from "validator";

const validateURL =(url, regex, fieldName)=>{
    validString(url, fieldName);
    if(!regex.test(url)){
        throw `${fieldName} must have a valid format`;
    }
    return url.trim();
}
const validateName= (name, fieldName)=>{
    validString(name, fieldName);
    name = name.trim();
    if(!/^[a-zA-Z\s'-]+$/.test(name)){
        throw `${fieldName} must only contain letters, spaces, hyphens, or apostrophes`;
    }
    if(!validator.isLength(name, {max:50})){
        throw  `${fieldName} can not be more than 50 characters`;
    }
    return name.trim();
}
const validateEmail=(email, fieldName)=>{
    validString(email,fieldName);
    if(!validator.isEmail(email)){
        throw `${fieldName} should be a valid Email`;
    }
    if(!validator.isLength(email, {max:255})){
        throw  `${fieldName} can not be more than 255 characters`;
    }
    return email.trim();
}

const validatePhone =(phone, fieldName)=>{
    validString(phone, fieldName);
    phone = validator.trim(phone);
    if(phone.length != 10){
        throw `${fieldName} must be 10 digits`;
    }
    if(!validator.isNumeric(phone)){
        throw `${fieldName} must be only numbers`;
    }
    return phone
}


const validateBirthDate = (birthDate, fieldName) => {
    // birth_date is no longer collected directly; age is confirmed via an
    // 18+ yes/no question on the frontend instead. Accept null/empty.
    if (!birthDate) {
        return null;
    }
    if (validator.toDate(birthDate) === null) {
        throw `${fieldName} must be a valid date format (YYYY-MM-DD)`;
    }
    return birthDate.trim();
};


const validateVisa_status =(visa)=>{
    visa = visa.trim();
    if(!visa || visa.length === 0){
        throw `Visa status is required`;
    }
    if(visa.length > 100){
        throw `Visa status can not be more than 100 characters`;
    }
    return visa;
}

const validateGender = (gen)=>{
    const genderMap = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Non-binary',
        'noanswer': 'Prefer not to say',
        'Male': 'Male',
        'Female': 'Female',
        'Non-binary': 'Non-binary',
        'Prefer not to say': 'Prefer not to say'
    };
    gen = gen.trim();
    const mapped = genderMap[gen] || genderMap[gen.toLowerCase()];
    if(!mapped){
        throw `Gender should be 'Male', 'Female', 'Other', or 'Prefer not to say' `;
    }
    return mapped;
}

const validatePhoneType =(phoneType)=>{
    const phoneTypeEnum =  ['Mobile', 'Home', 'Work'];
    phoneType = phoneType.trim();
    if(!enumValidate(phoneTypeEnum, phoneType)){
        throw `Phone type should be 'Mobile', 'Home', or 'Work' `;
    }      
    return phoneType
}

const validateOpt_support = (opt)=>{
    const optMap = {
        'yes': 'Yes, the OPT period has started',
        'approved': 'Yes, approved but have not received the EAD card',
        'no': 'No',
        'Yes, the OPT period has started': 'Yes, the OPT period has started',
        'Yes, approved but have not received the EAD card': 'Yes, approved but have not received the EAD card',
        'No': 'No'
    };
    opt = opt.trim();
    const mapped = optMap[opt];
    if(!mapped){
        throw `opt_support should be 'yes', 'approved', or 'no' `;
    }
    return mapped;
}

const personalDetails =(data)=>{
    //birth_date
    let {first_name, middle_name, last_name, birth_date, personal_email, phone,  additional_info, additional_websites, linkedin_url, country_id} = data;
    first_name = validateName(first_name, "First name");
    last_name = validateName(last_name, "Last name");
    if(middle_name && middle_name.trim().length >0){
        validateName(middle_name, "Middle name");
    }
    middle_name = notAvaiableString(middle_name); // returns trim if string is avaible or returns null

    birth_date = validateBirthDate(birth_date, "Birth date");
    personal_email = validateEmail(personal_email, "Perosal email");
    phone = validatePhone(phone, "Personal phone number");
    if(linkedin_url && linkedin_url.trim().length > 0){
        linkedin_url = validateURL(linkedin_url, /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company|school)\/[a-zA-Z0-9-_/]+\/?$/, "LinkedIn Url");
    } else {
        linkedin_url = null;
    }
    if(additional_websites){
        validateURL(additional_websites, /^https:\/\/((([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,}|localhost)(:\d+)?(\/[^\s]*)?$/, "Additional website");
    }
    additional_websites = notAvaiableString(additional_websites);
    if(additional_info){
        validateText(additional_info, "Additonal Info", 5000);
    }
    additional_info = notAvaiableString(additional_info);
    validatePrimaryId(country_id, "home country");
    return {first_name, middle_name, last_name, birth_date, personal_email, phone,  additional_info, additional_websites, linkedin_url, country_id}
}

const keelWorks = (data)=>{
    let {why_kworks, hours_commitment, start_date} = data;
    validateText(why_kworks, "Why KeelWorks", 10000);
    why_kworks = why_kworks.trim();

    if(typeof hours_commitment != "number" || hours_commitment>168){
        throw `Please provide valid hours commirment.`
    }
    if(start_date == undefined || start_date.trim().length == 0 || validator.toDate(start_date) == null){
        throw `Please provide valid start date`;
    }
    start_date = start_date.trim();
    return {why_kworks, hours_commitment, start_date}
}

const employee = (data)=>{
    let{first_name, middle_name, last_name,birth_date, personal_email, phone, additional_info, additional_websites, linkedin_url, country_id, why_kworks, interested_role, hours_commitment, start_date, visa_status, gender,  phonetype, opt_support, time_zone } = data;
    visa_status = validateVisa_status(visa_status);
    gender =  validateGender(gender);
    phonetype = validatePhoneType(phonetype);
    opt_support = validateOpt_support(opt_support);
    const p_data = personalDetails({first_name, middle_name, last_name, birth_date,personal_email, phone, additional_info, additional_websites, linkedin_url, country_id})
    const k_data = keelWorks({why_kworks, hours_commitment, start_date});
    validateText(time_zone, "time zone", 60);
    time_zone = time_zone.trim();
    interested_role = (interested_role && interested_role.trim().length > 0) ? interested_role.trim() : null;
    return {...p_data, ...k_data, interested_role, visa_status, gender, phonetype, opt_support, time_zone};
}

export default employee;