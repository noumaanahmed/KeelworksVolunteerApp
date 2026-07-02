import { AppError } from "../utils/app-error.js";
import {
  createApplication,
  findAdminApplicationById,
  findBlockingApplicationByUserOrEmail,
  findApplicationsByUserId,
  listApplications,
  listApplicationFilterOptions,
  countApplicationsByStatus,
  countApplicationsUpToEmployeeId,
  updateApplicationStatus as updateApplicationStatusRecord,
} from "../repositories/applications.repository.js";
import { assertLocationReferencesExist } from "./locations.service.js";
import { validateApplicationPayload, validatePagination } from "../validators/application.validator.js";
import {
  toAdminApplicationDetail,
  toAdminApplicationRow,
  toApplicationSummary,
} from "../mappers/application.mapper.js";
import {
  APPLICATION_STATUS_LABELS,
  getAllowedTransitions,
  getStatusActions,
  isKnownApplicationStatus,
} from "../constants/application-status.js";

const duplicateMessage = (field) => {
  const labels = {
    phone: "This phone number",
    personal_email: "This email address",
    linkedin_url: "This LinkedIn URL",
  };
  return `${labels[field] || "This value"} is already associated with an existing application.`;
};

const normalizeNote = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

export const submitApplication = async (payload, authenticatedUser) => {
  const validated = validateApplicationPayload(payload, authenticatedUser);

  await assertLocationReferencesExist({
    cityId: validated.address.city_id,
    countryId: validated.employee.country_id,
  });

  const blockingApplication = await findBlockingApplicationByUserOrEmail({
    userId: authenticatedUser.user_id,
    email: validated.employee.personal_email,
  });

  if (blockingApplication) {
    throw new AppError(
      "You already have an application in progress. You can submit a new application only after the current one is declined.",
      409,
      "ACTIVE_APPLICATION_EXISTS"
    );
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
  const requestedStatus = query?.status ? String(query.status).trim() : "";
  const requestedSearch = query?.search ? String(query.search).trim().slice(0, 100) : "";
  const requestedRole = query?.role ? String(query.role).trim().slice(0, 120) : "";
  const requestedAppliedDate = query?.applied_date ? String(query.applied_date).trim() : "";
  const requestedSort = String(query?.sort || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const requestedSortBy = ["id", "name", "email", "role", "applied"].includes(String(query?.sort_by || "").toLowerCase())
    ? String(query.sort_by).toLowerCase()
    : "id";

  if (requestedStatus && !isKnownApplicationStatus(requestedStatus)) {
    throw new AppError("Unknown application status filter.", 400, "INVALID_APPLICATION_STATUS", { status: requestedStatus });
  }

  if (requestedAppliedDate && !/^\d{4}-\d{2}-\d{2}$/.test(requestedAppliedDate)) {
    throw new AppError("Applied date filter must use YYYY-MM-DD format.", 400, "INVALID_APPLIED_DATE_FILTER");
  }

  const [result, statusCounts, filterOptions] = await Promise.all([
    listApplications({
      limit,
      offset,
      status: requestedStatus || null,
      search: requestedSearch,
      role: requestedRole || null,
      appliedDate: requestedAppliedDate || null,
      sortBy: requestedSortBy,
      sortDirection: requestedSort,
    }),
    countApplicationsByStatus(),
    listApplicationFilterOptions(),
  ]);
  const total = result.count;

  const applications = await Promise.all(
    result.rows.map(async (application) => ({
      ...toAdminApplicationRow(application),
      application_number: await countApplicationsUpToEmployeeId(application.employee_id),
    }))
  );

  return {
    applications,
    status_counts: statusCounts,
    pagination: {
      total,
      current_page: page,
      total_pages: Math.ceil(total / limit),
      per_page: limit,
    },
    filter: {
      status: requestedStatus || null,
      search: requestedSearch || null,
      role: requestedRole || null,
      applied_date: requestedAppliedDate || null,
      sort_by: requestedSortBy,
      sort: requestedSort.toLowerCase(),
    },
    filter_options: filterOptions,
  };
};

export const getAdminApplicationDetail = async (employeeId) => {
  const id = Number(employeeId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Application id must be a positive number.", 400, "INVALID_APPLICATION_ID");
  }

  const application = await findAdminApplicationById(id);
  if (!application) {
    throw new AppError("Application not found.", 404, "APPLICATION_NOT_FOUND");
  }

  const detail = toAdminApplicationDetail(application);
  detail.application_number = await countApplicationsUpToEmployeeId(id);
  return detail;
};

export const changeAdminApplicationStatus = async ({ employeeId, payload, authenticatedUser }) => {
  const id = Number(employeeId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Application id must be a positive number.", 400, "INVALID_APPLICATION_ID");
  }

  const nextStatus = String(payload?.status || "").trim();
  if (!isKnownApplicationStatus(nextStatus)) {
    throw new AppError("Unknown application status.", 400, "INVALID_APPLICATION_STATUS", { status: nextStatus });
  }

  const currentApplication = await findAdminApplicationById(id);
  if (!currentApplication) {
    throw new AppError("Application not found.", 404, "APPLICATION_NOT_FOUND");
  }

  const currentStatus = currentApplication.application_status;
  const allowedTransitions = getAllowedTransitions(currentStatus);

  if (!allowedTransitions.includes(nextStatus)) {
    throw new AppError(
      `Cannot move application from ${APPLICATION_STATUS_LABELS[currentStatus] || currentStatus} to ${APPLICATION_STATUS_LABELS[nextStatus] || nextStatus}.`,
      400,
      "INVALID_STATUS_TRANSITION",
      { current_status: currentStatus, requested_status: nextStatus, allowed_transitions: allowedTransitions }
    );
  }

  const action = getStatusActions(currentStatus).find((item) => item.next_status === nextStatus);
  const forwardedTo = normalizeNote(payload?.forwarded_to);

  if (action?.requires_forwarded_to && !forwardedTo) {
    throw new AppError("Forwarded applications require a lead email or lead name.", 400, "FORWARDED_TO_REQUIRED");
  }

  await updateApplicationStatusRecord({
    employeeId: id,
    newStatus: nextStatus,
    note: normalizeNote(payload?.note),
    forwardedTo,
    actionLabel: action?.label || APPLICATION_STATUS_LABELS[nextStatus] || nextStatus,
    changedByUserId: authenticatedUser?.user_id || null,
  });

  return getAdminApplicationDetail(id);
};
