import { validateText, validateDate } from "../commonValidaitons.js";
const education = (data)=>{
    if(data == undefined){
        throw `Education is needed`;
    }
    let validated = []
    for(let i = 0; i<data.length; i++){
        let {institution_name, degree, major, start_date, end_date} = data[i];
        validateText(institution_name, "Institution name", 50);
        validateText(degree, "Degree", 50);
        validateText(major, "Major", 50 );
        validateDate(start_date, "start date");
        if (new Date(start_date) > new Date()) {
           throw `Start date can't be in the future for ${institution_name}`;
        } 
        if(end_date){
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

export default education;