import { dbInstance } from '../config/dbConnect.js';
import Address from '../data/models/addressModel.js';
import EEOData from '../data/models/eeoModel.js';
import Education from '../data/models/educationModel.js';
import Employee from '../data/models/employeeModel.js';
import Employment from '../data/models/employmentModel.js';

export const registerEmployee = async (data)=>{
    let {employee_data, address_data, education_data, employment_data, eod_data} = data;
    const transaction = await dbInstance.transaction();
    try {
    // Create address
    const newAddress = await Address.create(address_data, { transaction });
        
    // Create employee
    employee_data["application_status"] = 'Pending';
    employee_data["address_id"] = newAddress.address_id;

    const newEmployee = await Employee.create( employee_data, { transaction });

    // Create EEO data 
    eod_data["submission_date"] = new Date();
    const newEEOData = await EEOData.create(eod_data, { transaction });

    // Create education entries
    const educationEntries = await Promise.all(
        education_data.map((education) => {
            education["employee_id"] = newEmployee.employee_id;
            return Education.create(education, { transaction })
        })
    );

    const employmentEntries = await Promise.all(
        employment_data.map((employment) => {
            employment["employee_id"] = newEmployee.employee_id;
            return Employment.create(employment, { transaction }) // Fixed: added return and using correct variable
        })
    );

    
    // Commit transaction
    await transaction.commit();
    return newEmployee.employee_id;
    }catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;  // Throw error instead of using next
    }
}