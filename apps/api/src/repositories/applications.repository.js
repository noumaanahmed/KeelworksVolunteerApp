import { db } from "../config/database.js";
import { Address, Education, EEOData, Employee, Employment } from "../models/index.js";

export const findApplicationByEmail = (email) =>
  Employee.findOne({ where: { personal_email: email } });

export const findApplicationsByUserId = (userId) =>
  Employee.findAll({
    where: { user_id: userId },
    order: [["employee_id", "DESC"]],
    attributes: [
      "employee_id",
      "first_name",
      "middle_name",
      "last_name",
      "interested_role",
      "application_status",
      "application_date",
    ],
  });

export const listApplications = ({ limit, offset }) =>
  Employee.findAndCountAll({
    order: [["employee_id", "DESC"]],
    limit,
    offset,
    attributes: [
      "employee_id",
      "first_name",
      "middle_name",
      "last_name",
      "personal_email",
      "phone",
      "phonetype",
      "gender",
      "time_zone",
      "visa_status",
      "opt_support",
      "hours_commitment",
      "start_date",
      "application_status",
      "application_date",
      "linkedin_url",
      "additional_websites",
      "why_kworks",
      "additional_info",
      "interested_role",
    ],
  });

export const createApplication = async ({ employee, address, education, employment, eeo }) => {
  const transaction = await db.transaction();

  try {
    const createdAddress = await Address.create(address, { transaction });

    const createdEmployee = await Employee.create(
      {
        ...employee,
        application_status: "Pending",
        address_id: createdAddress.address_id,
      },
      { transaction }
    );

    await EEOData.create(
      {
        ...eeo,
        employee_id: createdEmployee.employee_id,
        submission_date: new Date(),
      },
      { transaction }
    );

    await Education.bulkCreate(
      education.map((item) => ({ ...item, employee_id: createdEmployee.employee_id })),
      { transaction }
    );

    await Employment.bulkCreate(
      employment.map((item) => ({ ...item, employee_id: createdEmployee.employee_id })),
      { transaction }
    );

    await transaction.commit();
    return createdEmployee;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
