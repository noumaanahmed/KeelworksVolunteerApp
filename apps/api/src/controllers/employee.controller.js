// controllers/employee.controller.js
import Employee from '../models/employeeModel.js';
import newValidations from "../validators/application/index.js"
import locationDataFunctions from "../repositories/location.repository.js"
import "dotenv/config";
import employeePostMapper from '../mappers/employee.mapper.js';
import { registerEmployee } from '../repositories/application.repository.js';

// Helper function for standardized response format
const createResponse = (status, statusCode, message, data = null, error = null) => ({
    status,
    statusCode,
    message,
    data,
    error
});

/**
 * Create a new employee with associated records
 * @route POST /api/v1/apply/employees
 */
export const createEmployee = async (req, res, next) => {
 
       let {employee_data, address_data, education_data, employment_data, eod_data} = employeePostMapper(req.body);

        try {
            employee_data = newValidations.employee(employee_data);
            address_data = newValidations.address(address_data);
            education_data = newValidations.education(education_data);
            employment_data = newValidations.employment(employment_data);
            eod_data = newValidations.EOD(eod_data);
            console.log(employee_data, address_data, education_data, employment_data, eod_data);
        } catch (error) {
            console.log(error);
            return res.status(400).json(createResponse('Bad request', 400, null, null, error));
        }

        //404 validation. 
        // It will check if correct Forgein key is provided or not:
        try {
            await locationDataFunctions.cityExist(address_data.city_id);
            await locationDataFunctions.countryExist(employee_data.country_id);
        } catch (error) {
            console.log(error);
            return res.status(400).json(createResponse('not found', 404, null, null, error));
        }
       
        // Check for duplicate email
        // const existingEmployee = await Employee.findOne({
        //     where: { personal_email }});

        const existingEmployee = await Employee.findOne({
                where: { personal_email: employee_data.personal_email }});

        if (existingEmployee) {
            return res.status(409).json(createResponse(
                'error',
                409,
                'Email already exists',
                null,
                'DUPLICATE_EMAIL'
            ));
        }
        
        try {
const employeeId = await registerEmployee({
    employee_data,
    address_data,
    education_data,
    employment_data,
    eod_data
});

return res.status(201).json(createResponse(
    'success',
    201,
    'Employee created successfully',
    {
        employee: {
            employee_id: employeeId
        }
    }
));
        } catch (error) {
            console.error('registerEmployee error:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                const fieldLabels = {
                    phone: 'This phone number',
                    personal_email: 'This email address',
                    linkedin_url: 'This LinkedIn URL',
                };
                const dupField = error.errors?.[0]?.path;
                const friendlyMsg = `${fieldLabels[dupField] || 'This value'} is already associated with an existing application.`;
                return res.status(409).json(createResponse('error', 409, null, null, friendlyMsg));
            }

            return res.status(500).json(createResponse('SERVER_ERROR', 500, 'something went wrong', null, error.message || String(error)));
        }
};


export const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);

    // Default error response
    let errorResponse = createResponse(
        'error',
        500,
        'Internal server error',
        null,
        {
            type: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
    );

    // Handle specific error types
    if (error.name === 'SequelizeValidationError') {
        errorResponse = createResponse(
            'error',
            400,
            'Validation error',
            null,
            {
                type: 'VALIDATION_ERROR',
                details: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            }
        );
    } else if (error.name === 'SequelizeUniqueConstraintError') {
        errorResponse = createResponse(
            'error',
            409,
            'Duplicate entry',
            null,
            {
                type: 'DUPLICATE_ENTRY',
                details: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            }
        );
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        errorResponse = createResponse(
            'error',
            400,
            'Invalid reference',
            null,
            {
                type: 'INVALID_REFERENCE',
                details: error.fields
            }
        );
    }

    res.status(errorResponse.statusCode).json(errorResponse);
};


//************************************************************************************************************
//************************************************************************************************************
//  * NO AUTHENTICATION IN PLACE. SHOULD NOT BE USED. *
// ***********************************************************************************************************
// ***********************************************************************************************************



 /* Get all employees with pagination and filters
  * @route GET /api/v1/apply/employees
  */
 export const getAllEmployees = async (req, res, next) => {
     try {
         const page = parseInt(req.query.page) || 1;
         const limit = parseInt(req.query.limit) || 10;
         const offset = (page - 1) * limit;

         // Get employees with basic pagination
         const employees = await Employee.findAndCountAll({
            order: [['employee_id', 'DESC']], // Order by ID descending
             limit,
             offset
         });

//         // Handle no results
         if (employees.count === 0) {
             return res.status(204).json({
                status: 'success',
                 statusCode: 204,
                 message: 'No employees found',
                 data: []
             });
         }

//         // Return paginated results
         return res.status(200).json({
             status: 'success',
             statusCode: 200,
             message: 'Employees retrieved successfully',
             data: {
                 employees: employees.rows,
                 pagination: {
                     total: employees.count,
                     current_page: page,
                     total_pages: Math.ceil(employees.count / limit),
                     per_page: limit
                 }
             }
         });
     } catch (error) {
         console.error('Error in getAllEmployees:', error);
         next(error);
     }
 };

 /**
  * NO AUTHENTICATION IN PLACE. SHOULD NOT BE USED. 
 * Get employee by ID
  * @route GET /api/v1/apply/employees/:id
  */
 export const getEmployeeById = async (req, res, next) => {
     try {
         const { id } = req.params;

         const employee = await Employee.findByPk(id);

         if (!employee) {
             return res.status(404).json({
                 status: 'error',
                 statusCode: 404,
                 message: 'Employee not found',
                 error: 'RESOURCE_NOT_FOUND'
             });
         }

         return res.status(200).json({
             status: 'success',
             statusCode: 200,
             message: 'Employee retrieved successfully',
             data: { employee }
         });
     } catch (error) {
         console.error('Error in getEmployeeById:', error);
         next(error);
     }
 };

/*
//  * NO AUTHENTICATION IN PLACE. SHOULD NOT BE USED.
//  * Update employee by ID
  * @route PUT /api/v1/apply/employees/:id
  */
 export const updateEmployee = async (req, res, next) => {
     try {
         const { id } = req.params;
         const updateData = req.body;

         // Find employee first
         const employee = await Employee.findByPk(id);

         if (!employee) {
             return res.status(404).json({
                 status: 'error',
                 statusCode: 404,
                 message: 'Employee not found',
                 error: 'RESOURCE_NOT_FOUND'
             });
         }

         // Check if email is being updated and if it's already in use
         if (updateData.personal_email && updateData.personal_email !== employee.personal_email) {
             const existingEmail = await Employee.findOne({
                 where: { personal_email: updateData.personal_email }
             });

             if (existingEmail) {
                 return res.status(409).json({
                     status: 'error',
                     statusCode: 409,
                     message: 'Email already exists',
                     error: 'DUPLICATE_EMAIL'
                 });
             }
         }

         // Update employee
         await employee.update({
             first_name: updateData.first_name || employee.first_name,
             middle_name: updateData.middle_name || employee.middle_name,
             last_name: updateData.last_name || employee.last_name,
             birth_date: updateData.birth_date || employee.birth_date,
             linkedin_url: updateData.linkedin_url || employee.linkedin_url,
             personal_email: updateData.personal_email || employee.personal_email,
             phone: updateData.phone || employee.phone,
             phonetype: updateData.phonetype || employee.phonetype,
             country_code_phone: updateData.country_code_phone || employee.country_code_phone,
             homecountry_id: updateData.homecountry_id || employee.homecountry_id,
             gender: updateData.gender || employee.gender,
             opt_support: updateData.opt_support !== undefined ? updateData.opt_support : employee.opt_support,
             desired_start_date: updateData.desired_start_date || employee.desired_start_date,
             hours_commitment: updateData.hours_commitment || employee.hours_commitment,
             why_kworks: updateData.why_kworks || employee.why_kworks,
             time_zone: updateData.time_zone || employee.time_zone,
             visa_status: updateData.visa_status || employee.visa_status,
             application_status: updateData.application_status || employee.application_status,
             additional_websites: updateData.additional_websites || employee.additional_websites,
             additional_info: updateData.additional_info || employee.additional_info,
             updated_at: new Date()
         });

//         // Fetch updated employee
         const updatedEmployee = await Employee.findByPk(id);

         return res.status(200).json({
             status: 'success',
             statusCode: 200,
             message: 'Employee updated successfully',
             data: { employee: updatedEmployee }
         });
     } catch (error) {
         console.error('Error in updateEmployee:', error);
         next(error);
     }
 };

 /**
//  * NO AUTHENTICATION IN PLACE. SHOULD NOT BE USED.
//  * Delete employee by ID
  * @route DELETE /api/v1/apply/employees/:id
  */
 export const deleteEmployee = async (req, res, next) => {
     try {
         const { id } = req.params;

         // Find employee first
         const employee = await Employee.findByPk(id);

         if (!employee) {
             return res.status(404).json({
                 status: 'error',
                 statusCode: 404,
                 message: 'Employee not found',
                 error: 'RESOURCE_NOT_FOUND'
             });
         }

         await employee.update({
             is_active: false,
             updated_at: new Date()
         });

         return res.status(200).json({
             status: 'success',
             statusCode: 200,
             message: 'Employee deleted successfully'
         });
     } catch (error) {
         console.error('Error in deleteEmployee:', error);
         next(error);
     }
 };

// /**
//  * Global error handler
//  */

