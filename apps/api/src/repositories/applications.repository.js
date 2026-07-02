import { Op, fn, col } from "sequelize";
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
  "user_id",
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

export const findBlockingApplicationByUserOrEmail = ({ userId, email }) => {
  const conditions = [];
  if (userId) conditions.push({ user_id: userId });
  if (email) conditions.push({ personal_email: email });

  if (conditions.length === 0) return null;

  return Employee.findOne({
    where: {
      [Op.or]: conditions,
      application_status: { [Op.ne]: APPLICATION_STATUS.DECLINED },
    },
    order: [["employee_id", "DESC"]],
  });
};

export const findApplicationsByUserId = (userId) =>
  Employee.findAll({
    where: { user_id: userId },
    order: [
      ["employee_id", "DESC"],
      [{ model: ApplicationStatusHistory, as: "status_history" }, "history_id", "ASC"],
    ],
    attributes: [
      "employee_id",
      "first_name",
      "middle_name",
      "last_name",
      "interested_role",
      "application_status",
      "application_date",
    ],
    include: [
      {
        model: ApplicationStatusHistory,
        as: "status_history",
        attributes: [
          "history_id",
          "previous_status",
          "new_status",
          "note",
          "forwarded_to",
          "action_label",
          "created_at",
        ],
      },
    ],
  });

const normalizeDateStart = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;

  const start = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(start.getTime()) ? null : start;
};

const normalizeDateEndExclusive = (value) => {
  const start = normalizeDateStart(value);
  if (!start) return null;

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return end;
};

const getSortOrder = ({ sortBy = "id", sortDirection = "DESC" }) => {
  const direction = String(sortDirection).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const sortMap = {
    id: [["employee_id", direction]],
    name: [["first_name", direction], ["last_name", direction], ["employee_id", "DESC"]],
    email: [["personal_email", direction], ["employee_id", "DESC"]],
    role: [["interested_role", direction], ["employee_id", "DESC"]],
    applied: [["application_date", direction], ["employee_id", "DESC"]],
  };

  return sortMap[String(sortBy).toLowerCase()] || sortMap.id;
};

export const listApplications = ({
  limit,
  offset,
  status,
  search,
  role,
  appliedDateStart,
  appliedDateEnd,
  sortBy = "id",
  sortDirection = "DESC",
}) => {
  const where = {};

  if (status) {
    where.application_status = status;
  }

  if (role) {
    where.interested_role = role;
  }

  const dateStart = normalizeDateStart(appliedDateStart);
  const dateEnd = normalizeDateEndExclusive(appliedDateEnd);
  if (dateStart || dateEnd) {
    where.application_date = {};
    if (dateStart) where.application_date[Op.gte] = dateStart;
    if (dateEnd) where.application_date[Op.lt] = dateEnd;
  }

  const normalizedSearch = search ? String(search).trim() : "";
  if (normalizedSearch) {
    const cleanSearch = normalizedSearch.replace(/^#/, "");
    const likeSearch = `%${cleanSearch}%`;
    const searchConditions = [
      { first_name: { [Op.like]: likeSearch } },
      { last_name: { [Op.like]: likeSearch } },
      { personal_email: { [Op.like]: likeSearch } },
    ];

    const nameParts = cleanSearch.split(/\s+/).filter(Boolean);
    if (nameParts.length >= 2) {
      searchConditions.push({
        [Op.and]: [
          { first_name: { [Op.like]: `%${nameParts[0]}%` } },
          { last_name: { [Op.like]: `%${nameParts.slice(1).join(" ")}%` } },
        ],
      });
      searchConditions.push({
        [Op.and]: [
          { first_name: { [Op.like]: `%${nameParts.slice(1).join(" ")}%` } },
          { last_name: { [Op.like]: `%${nameParts[0]}%` } },
        ],
      });
    }

    where[Op.or] = searchConditions;
  }

  return Employee.findAndCountAll({
    where,
    order: getSortOrder({ sortBy, sortDirection }),
    limit,
    offset,
    attributes: applicationListAttributes,
  });
};

export const listApplicationFilterOptions = async () => {
  const [roleRows, dateRows] = await Promise.all([
    Employee.findAll({
      attributes: [[fn("DISTINCT", col("interested_role")), "role"]],
      where: {
        interested_role: { [Op.ne]: null },
      },
      order: [["interested_role", "ASC"]],
      raw: true,
    }),
    Employee.findAll({
      attributes: [[fn("DATE", col("application_date")), "applied_date"]],
      group: [fn("DATE", col("application_date"))],
      order: [[fn("DATE", col("application_date")), "DESC"]],
      raw: true,
    }),
  ]);

  return {
    roles: roleRows
      .map((row) => row.role)
      .filter((roleValue) => typeof roleValue === "string" && roleValue.trim())
      .map((roleValue) => roleValue.trim()),
    applied_dates: dateRows
      .map((row) => row.applied_date)
      .filter(Boolean),
  };
};

export const countApplicationsByStatus = async () => {
  const rows = await Employee.findAll({
    attributes: ["application_status", [fn("COUNT", col("employee_id")), "count"]],
    group: ["application_status"],
    raw: true,
  });

  return rows.reduce((counts, row) => {
    counts[row.application_status] = Number(row.count) || 0;
    counts.total += Number(row.count) || 0;
    return counts;
  }, { total: 0 });
};

export const countApplicationsUpToEmployeeId = (employeeId) =>
  Employee.count({ where: { employee_id: { [Op.lte]: employeeId } } });

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
