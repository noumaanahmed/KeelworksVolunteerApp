// src/docs/swagger/schemas/employee.schema.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - birth_date
 *         - personal_email
 *         - phone
 *         - phonetype
 *         - address_id
 *         - gender
 *         - opt_support
 *         - desired_start_date
 *         - hours_commitment
 *         - why_kworks
 *         - visa_status
 *         - country_code_phone
 *         - application_status
 *       properties:
 *         employee_id:
 *           type: integer
 *           readOnly: true
 *         profile_pic_url:
 *           type: string
 *           maxLength: 255
 *         first_name:
 *           type: string
 *           maxLength: 50
 *         middle_name:
 *           type: string
 *           maxLength: 50
 *         last_name:
 *           type: string
 *           maxLength: 50
 *         birth_date:
 *           type: string
 *           format: date
 *         linkedin_url:
 *           type: string
 *           maxLength: 255
 *           uniqueItems: true
 *         personal_email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           uniqueItems: true
 *         phone:
 *           type: string
 *           maxLength: 20
 *           uniqueItems: true
 *         phonetype:
 *           type: string
 *           enum: [Mobile, Home, Work]
 *         address_id:
 *           type: integer
 *         homecountry_id:
 *           type: integer
 *         gender:
 *           type: string
 *           enum: [Male, Female, Non-binary, Prefer not to say]
 *         opt_support:
 *           type: string
 *           enum: 
 *             - 'Yes, the OPT period has started'
 *             - 'Yes, approved but have not received the EAD card'
 *             - 'No'
 *         desired_start_date:
 *           type: string
 *           format: date
 *         hours_commitment:
 *           type: integer
 *         why_kworks:
 *           type: string
 *         time_zone:
 *           type: string
 *           maxLength: 255
 *         visa_status:
 *           type: string
 *           enum: [Citizen, Permanent Resident, Student Visa, Work Visa, Other]
 *         country_code_phone:
 *           type: string
 *           maxLength: 5
 *         application_status:
 *           type: string
 *           enum: [Pending, Reviewing, Approved, Rejected]
 *         application_date:
 *           type: string
 *           format: date
 *         is_active:
 *           type: boolean
 *           default: true
 *         additional_websites:
 *           type: string
 *           maxLength: 255
 *         additional_info:
 *           type: string
 *       example:
 *         first_name: "John"
 *         last_name: "Doe"
 *         birth_date: "1990-01-01"
 *         personal_email: "john.doe@example.com"
 *         phone: "1234567890"
 *         phonetype: "Mobile"
 *         gender: "Male"
 *         opt_support: "No"
 *         desired_start_date: "2024-01-01"
 *         hours_commitment: 40
 *         why_kworks: "Passionate about contributing to meaningful projects"
 *         visa_status: "Citizen"
 *         country_code_phone: "+1"
 *         application_status: "Pending"
 */