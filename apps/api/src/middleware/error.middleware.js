import { AppError } from "../utils/app-error.js";
import { errorResponse } from "../utils/api-response.js";

const sequelizeErrorDetails = (error) =>
  error.errors?.map((item) => ({ field: item.path, message: item.message })) || null;

export const notFoundHandler = (req, res) => {
  return res.status(404).json(errorResponse("Route not found.", "ROUTE_NOT_FOUND", 404));
};

export const errorHandler = (error, req, res, next) => {
  console.error("API error:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      errorResponse(error.message, {
        code: error.code,
        details: error.details,
      }, error.statusCode)
    );
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json(
      errorResponse("Validation error.", {
        code: "SEQUELIZE_VALIDATION_ERROR",
        details: sequelizeErrorDetails(error),
      }, 400)
    );
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json(
      errorResponse("Duplicate entry.", {
        code: "DUPLICATE_ENTRY",
        details: sequelizeErrorDetails(error),
      }, 409)
    );
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json(
      errorResponse("Invalid database reference.", {
        code: "INVALID_REFERENCE",
        details: error.fields || null,
      }, 400)
    );
  }

  const payload = process.env.NODE_ENV === "development"
    ? { code: "INTERNAL_SERVER_ERROR", details: error.stack }
    : { code: "INTERNAL_SERVER_ERROR" };

  return res.status(500).json(errorResponse("Internal server error.", payload, 500));
};
