import validator from "validator";
import { AppError } from "../utils/app-error.js";

const fail = (message, details = null) => {
  throw new AppError(message, 400, "VALIDATION_ERROR", details);
};

const toTrimmedString = (value, fieldName) => {
  if (value === undefined || value === null) fail(`${fieldName} is required.`);
  if (typeof value !== "string") fail(`${fieldName} must be a string.`);

  const trimmed = value.trim();
  if (!trimmed) fail(`${fieldName} cannot be empty.`);
  return trimmed;
};

const optionalString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const text = (value, fieldName, maxLength = 1000) => {
  const trimmed = toTrimmedString(value, fieldName);
  if (trimmed.length > maxLength) {
    fail(`${fieldName} must be ${maxLength} characters or fewer.`);
  }
  return trimmed;
};

const primaryId = (value, fieldName) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0 || id > 10000000) {
    fail(`${fieldName} must be a valid numeric ID.`);
  }
  return id;
};

const date = (value, fieldName) => {
  const trimmed = toTrimmedString(value, fieldName);
  if (!validator.isDate(trimmed, { format: "YYYY-MM-DD", strictMode: true })) {
    fail(`${fieldName} must be a valid date in YYYY-MM-DD format.`);
  }
  return trimmed;
};

const notFutureDate = (value, fieldName) => {
  const validated = date(value, fieldName);
  if (new Date(validated) > new Date()) fail(`${fieldName} cannot be in the future.`);
  return validated;
};

const name = (value, fieldName) => {
  const trimmed = text(value, fieldName, 50);
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    fail(`${fieldName} may only contain letters, spaces, hyphens, or apostrophes.`);
  }
  return trimmed;
};

const email = (value, fieldName) => {
  const trimmed = text(value, fieldName, 255).toLowerCase();
  if (!validator.isEmail(trimmed)) fail(`${fieldName} must be a valid email address.`);
  return trimmed;
};

const phone = (value, fieldName) => {
  const digits = text(value, fieldName, 20).replace(/\D/g, "");
  if (!/^\d{10}$/.test(digits)) fail(`${fieldName} must be exactly 10 digits.`);
  return digits;
};

const enumValue = (value, fieldName, allowedValues) => {
  const trimmed = text(value, fieldName, 255);
  if (!allowedValues.includes(trimmed)) {
    fail(`${fieldName} must be one of: ${allowedValues.join(", ")}.`);
  }
  return trimmed;
};

const mapEnum = (value, fieldName, mappings) => {
  const trimmed = text(value, fieldName, 255);
  const mapped = mappings[trimmed] || mappings[trimmed.toLowerCase()];
  if (!mapped) fail(`${fieldName} has an unsupported value.`);
  return mapped;
};

const optionalUrl = (value, fieldName, pattern = null) => {
  const trimmed = optionalString(value);
  if (!trimmed) return null;

  if (pattern && !pattern.test(trimmed)) {
    fail(`${fieldName} must be a valid URL.`);
  }

  if (!pattern && !validator.isURL(trimmed, { require_protocol: true })) {
    fail(`${fieldName} must be a valid URL including http:// or https://.`);
  }

  return trimmed;
};

const educationList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    fail("At least one education entry is required.");
  }

  return items.map((item, index) => {
    const startDate = notFutureDate(item.start_date, `Education ${index + 1} start date`);
    const endDate = optionalString(item.end_date);

    if (endDate) {
      date(endDate, `Education ${index + 1} end date`);
      if (new Date(startDate) > new Date(endDate)) {
        fail(`Education ${index + 1} end date must be after the start date.`);
      }
    }

    return {
      institution_name: text(item.institution_name, `Education ${index + 1} institution`, 255),
      degree: text(item.degree, `Education ${index + 1} degree`, 255),
      major: text(item.major, `Education ${index + 1} major`, 255),
      start_date: startDate,
      end_date: endDate,
    };
  });
};

const employmentList = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    fail("At least one employment entry is required.");
  }

  return items.map((item, index) => {
    const startDate = notFutureDate(item.start_date, `Employment ${index + 1} start date`);
    const endDate = optionalString(item.end_date);

    if (endDate) {
      date(endDate, `Employment ${index + 1} end date`);
      if (new Date(startDate) > new Date(endDate)) {
        fail(`Employment ${index + 1} end date must be after the start date.`);
      }
    }

    return {
      company_name: text(item.company_name, `Employment ${index + 1} company`, 255),
      job_title: text(item.job_title, `Employment ${index + 1} job title`, 255),
      location: text(item.location, `Employment ${index + 1} location`, 255),
      start_date: startDate,
      end_date: endDate,
      responsibilities: text(item.responsibilities, `Employment ${index + 1} responsibilities`, 5000),
    };
  });
};

export const validateApplicationPayload = (payload, authenticatedUser) => {
  if (!payload || typeof payload !== "object") fail("Application payload is required.");
  if (!authenticatedUser?.user_id || !authenticatedUser?.email) {
    throw new AppError("Authentication is required to submit an application.", 401, "AUTH_REQUIRED");
  }

  const personalEmail = email(payload.personal_email, "Personal email");
  if (personalEmail !== authenticatedUser.email.toLowerCase()) {
    throw new AppError(
      "The application email must match the signed-in applicant account.",
      403,
      "EMAIL_MISMATCH"
    );
  }

  const employee = {
    user_id: authenticatedUser.user_id,
    first_name: name(payload.first_name, "First name"),
    middle_name: optionalString(payload.middle_name),
    last_name: name(payload.last_name, "Last name"),
    birth_date: optionalString(payload.birth_date),
    personal_email: personalEmail,
    phone: phone(payload.phone, "Phone number"),
    phonetype: enumValue(payload.phonetype, "Phone type", ["Mobile", "Home", "Work"]),
    linkedin_url: optionalUrl(
      payload.linkedin_url,
      "LinkedIn URL",
      /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company|school)\/[a-zA-Z0-9-_/]+\/?$/
    ),
    additional_websites: optionalUrl(payload.additional_websites, "Additional website"),
    additional_info: optionalString(payload.additional_info),
    country_id: primaryId(payload.country_id, "Home country"),
    gender: mapEnum(payload.gender, "Gender", {
      male: "Male",
      female: "Female",
      other: "Non-binary",
      noanswer: "Prefer not to say",
      "Male": "Male",
      "Female": "Female",
      "Non-binary": "Non-binary",
      "Prefer not to say": "Prefer not to say",
    }),
    opt_support: mapEnum(payload.opt_support, "OPT support", {
      yes: "Yes, the OPT period has started",
      approved: "Yes, approved but have not received the EAD card",
      no: "No",
      "Yes, the OPT period has started": "Yes, the OPT period has started",
      "Yes, approved but have not received the EAD card": "Yes, approved but have not received the EAD card",
      "No": "No",
    }),
    start_date: date(payload.start_date, "Desired start date"),
    hours_commitment: primaryId(payload.hours_commitment, "Hours commitment"),
    why_kworks: text(payload.why_kworks, "Why KeelWorks", 10000),
    interested_role: optionalString(payload.interested_role),
    time_zone: text(payload.time_zone, "Time zone", 60),
    visa_status: text(payload.visa_status, "Visa status", 100),
  };

  if (employee.hours_commitment > 168) {
    fail("Hours commitment cannot be greater than 168 hours per week.");
  }

  const address = {
    address1: text(payload.address_line_1, "Address line 1", 255),
    address2: optionalString(payload.address_line_2),
    city_id: primaryId(payload.city_id, "City"),
    zip_code: text(payload.zip_code, "Zip code", 20),
  };

  const eeo = {
    sexual_orientation: mapEnum(payload.sexual_orientation, "Sexual orientation", {
      heterosexual: "Heterosexual",
      homosexual: "Homosexual",
      gay: "Homosexual",
      lesbian: "Homosexual",
      bisexual: "Bisexual",
      asexual: "Asexual",
      noanswer: "Prefer not to say",
      other: "Prefer not to say",
      "Heterosexual": "Heterosexual",
      "Homosexual": "Homosexual",
      "Bisexual": "Bisexual",
      "Asexual": "Asexual",
      "Prefer not to say": "Prefer not to say",
    }),
    disability: mapEnum(payload.disability, "Disability", {
      yes: "Yes",
      no: "No",
      noanswer: "Prefer not to say",
      "Yes": "Yes",
      "No": "No",
      "Prefer not to say": "Prefer not to say",
    }),
  };

  return {
    employee,
    address,
    education: educationList(payload.educations),
    employment: employmentList(payload.employments),
    eeo,
  };
};

export const validatePagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

export const validateCityResolution = ({ state_id, city_name }) => ({
  stateId: primaryId(state_id, "State"),
  cityName: text(city_name, "City name", 255),
});
