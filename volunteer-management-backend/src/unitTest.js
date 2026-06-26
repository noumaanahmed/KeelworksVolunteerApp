import validations from "./utils/validations/index.js";

const ad_data = {
  "address_line_1": "abc    ",
  "address_line_2": null,
  "city_id": 12,
  "zip_code": "400091",
}

console.log(validations.address(ad_data));

const ed_data =  [
  {
    "institution_name": "d",
    "degree": "Bachelor's",
    "major": "Computer Science",
    "start_date": "2010-08-15",
    "end_date": ""
  },
  {
    "institution_name": "University of ABC",
    "degree": "gggf",
    "major": "Software Engineering",
    "start_date": "2015-09-01",
    "end_date": "2017-05-15"
  }
];

console.log(validations.education(ed_data));

const job_data = [
  {
    "company_name": "Tech Corp",
    "job_title": "Software Developer",
    "location": "San Francisco, CA",
    "start_date": "2018-06-01",
    "end_date": "2019-05-13",
    "responsibilities": "hh"
  },
  {
    "company_name": "Innovative Solutions",
    "job_title": "Senior Developer",
    "location": "New York, NY",
    "start_date": "2022-01-01",
    "end_date": null,
    "responsibilities": "Led a team of developers in building cloud-native microservices."
  }
]

console.log(validations.employment(job_data));

const emp_data = 
  {
    "first_name": "Joe",
    "middle_name": "F",
    "last_name": "Doe",
    "birth_date": "1990-01-01",
    "linkedin_url": "https://www.linkedin.com/in/johnfdoe3",
    "personal_email": "johnFDoe5@example.com",
    "phone": "1234567896",
    "phonetype": "Mobile",
    "address_id": 1,
    "country_id": 1,
    "gender": "Male",
    "opt_support": "No",
    "start_date": "2025-02-01",
    "hours_commitment": 40,
    "why_kworks": "I am passionate about contributing to meaningful projects.",
    "visa_status": "Student Visa",
    "application_status": "Pending",
    "time_zone": "America/New_York",
    "additional_websites": "https://portfolio.johndoe.com",
    "additional_info": "Looking forward to collaborating with talented teams."
  
}

console.log(validations.employee(emp_data));