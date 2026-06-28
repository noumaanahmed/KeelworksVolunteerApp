import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") || [];

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Access token is required.", 401, "ACCESS_TOKEN_REQUIRED"));
  }

  try {
    req.user = jwt.verify(token, env.auth.jwtSecret);
    return next();
  } catch {
    return next(new AppError("Invalid or expired token.", 403, "INVALID_TOKEN"));
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin access is required.", 403, "ADMIN_REQUIRED"));
  }
  return next();
};
