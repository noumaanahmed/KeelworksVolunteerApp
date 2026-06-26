import { validateText, validateDate } from "../commonValidaitons.js";


const employment = (data)=>{
    if(data == undefined){
        throw  `Employment is needed`;
    }
    let validated = []

    for(let i = 0; i<data.length; i++){
        let {company_name, job_title, location, start_date, end_date, responsibilities} = data[i];
        validateText(company_name, "Company name", 100);
        validateText(job_title, "Job title", 100);
        validateText(location, "Loation", 100 );
        validateText(responsibilities, "Responsibilities", 5000);
        validateDate(start_date, "start date");
        if (new Date(start_date) > new Date()) {
            throw `Start date can't be in the future for ${company_name}`;
        } 
        if(end_date){
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

export default employment;