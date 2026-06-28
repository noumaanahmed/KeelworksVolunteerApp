import { AppError } from "../utils/app-error.js";
import {
  createApplication,
  findApplicationByEmail,
  findApplicationsByUserId,
  listApplications,
} from "../repositories/applications.repository.js";
import { assertLocationReferencesExist } from "./locations.service.js";
import { validateApplicationPayload, validatePagination } from "../validators/application.validator.js";
import { toAdminApplicationRow, toApplicationSummary } from "../mappers/application.mapper.js";

const duplicateMessage = (field) => {
  const labels = {
    phone: "This phone number",
    personal_email: "This email address",
    linkedin_url: "This LinkedIn URL",
  };
  return `${labels[field] || "This value"} is already associated with an existing application.`;
};

export const submitApplication = async (payload, authenticatedUser) => {
  const validated = validateApplicationPayload(payload, authenticatedUser);

  await assertLocationReferencesExist({
    cityId: validated.address.city_id,
    countryId: validated.employee.country_id,
  });

  const existingApplication = await findApplicationByEmail(validated.employee.personal_email);
  if (existingApplication) {
    throw new AppError("You have already submitted an application with this email.", 409, "DUPLICATE_APPLICATION");
  }

  try {
    const application = await createApplication(validated);
    return { employee_id: application.employee_id };
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const duplicateField = error.errors?.[0]?.path;
      throw new AppError(duplicateMessage(duplicateField), 409, "DUPLICATE_ENTRY", { field: duplicateField });
    }
    throw error;
  }
};

export const getMyApplications = async (authenticatedUser) => {
  if (!authenticatedUser?.user_id) {
    throw new AppError("Authentication is required.", 401, "AUTH_REQUIRED");
  }

  const applications = await findApplicationsByUserId(authenticatedUser.user_id);
  return applications.map(toApplicationSummary);
};

export const getAdminApplications = async (query) => {
  const { page, limit, offset } = validatePagination(query);
  const result = await listApplications({ limit, offset });

  return {
    applications: result.rows.map(toAdminApplicationRow),
    pagination: {
      total: result.count,
      current_page: page,
      total_pages: Math.ceil(result.count / limit),
      per_page: limit,
    },
  };
};
