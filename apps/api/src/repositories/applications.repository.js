import { db } from "../config/database.js";
import {
  Address,
  ApplicationStatusHistory,
  City,
  Country,
  Education,
  EEOData,
  Employee,
  Employment,
  State,
  User,
} from "../models/index.js";
import { APPLICATION_STATUS } from "../constants/application-status.js";

const applicationListAttributes = [
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
];

const applicationDetailIncludes = [
  {
    model: Address,
    include: [
      {
        model: City,
        include: [
          {
            model: State,
            include: [Country],
          },
        ],
      },
    ],
  },
  Country,
  Education,
  Employment,
  EEOData,
  {
    model: ApplicationStatusHistory,
    as: "status_history",
    include: [
      {
        model: User,
        as: "changed_by",
        attributes: ["user_id", "full_name", "email", "role"],
      },
    ],
  },
];

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
    attributes: applicationListAttributes,
  });

export const findAdminApplicationById = (employeeId) =>
  Employee.findByPk(employeeId, {
    attributes: applicationListAttributes,
    include: applicationDetailIncludes,
    order: [[{ model: ApplicationStatusHistory, as: "status_history" }, "history_id", "DESC"]],
  });

export const createApplication = async ({ employee, address, education, employment, eeo }) => {
  const transaction = await db.transaction();

  try {
    const createdAddress = await Address.create(address, { transaction });

    const createdEmployee = await Employee.create(
      {
        ...employee,
        application_status: APPLICATION_STATUS.SUBMITTED,
        address_id: createdAddress.address_id,
      },
      { transaction }
    );

    await ApplicationStatusHistory.create(
      {
        employee_id: createdEmployee.employee_id,
        previous_status: null,
        new_status: APPLICATION_STATUS.SUBMITTED,
        note: "Application submitted.",
        action_label: "Submitted",
        changed_by_user_id: employee.user_id || null,
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

export const updateApplicationStatus = async ({
  employeeId,
  newStatus,
  note,
  forwardedTo,
  actionLabel,
  changedByUserId,
}) => {
  const transaction = await db.transaction();

  try {
    const application = await Employee.findByPk(employeeId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!application) {
      await transaction.rollback();
      return null;
    }

    const previousStatus = application.application_status;

    await application.update(
      { application_status: newStatus },
      { transaction }
    );

    await ApplicationStatusHistory.create(
      {
        employee_id: employeeId,
        previous_status: previousStatus,
        new_status: newStatus,
        note: note || null,
        forwarded_to: forwardedTo || null,
        action_label: actionLabel || null,
        changed_by_user_id: changedByUserId || null,
      },
      { transaction }
    );

    await transaction.commit();
    return application;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
