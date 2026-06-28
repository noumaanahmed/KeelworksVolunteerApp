import { AppError } from "../utils/app-error.js";

export const requireJsonBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError("Request body is required.", 400, "REQUEST_BODY_REQUIRED"));
  }
  return next();
};
