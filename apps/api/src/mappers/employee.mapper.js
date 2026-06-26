const employeePostMapper = (input)=> {
    let {
        first_name, middle_name, last_name, birth_date,
        linkedin_url, personal_email, phone, phonetype,
        address_line_1, address_line_2, city_id, zip_code,
        country_id, time_zone, gender, opt_support,
        start_date, hours_commitment, why_kworks, interested_role,
        visa_status, additional_websites,
        additional_info, educations, employments, sexual_orientation, disability
    } = input;


    const employee_data = {first_name, middle_name, last_name, birth_date, personal_email, phone, additional_info, additional_websites, linkedin_url, country_id, why_kworks, interested_role, hours_commitment, start_date, visa_status, gender,  phonetype, opt_support, time_zone };

    const address_data = {address_line_1, address_line_2, city_id, zip_code};
    const education_data = educations;
    const employment_data = employments; 
    const eod_data = {sexual_orientation, disability}
    return {employee_data, address_data, education_data, employment_data, eod_data};
}

export default employeePostMapper;