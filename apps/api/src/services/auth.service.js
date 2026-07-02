import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import {
  createUser,
  findActiveUserByEmail,
  findUserByEmail,
  findUserById,
} from "../repositories/users.repository.js";

const publicUser = (user) => ({
  user_id: user.user_id,
  email: user.email,
  first_name: user.first_name,
  middle_name: user.middle_name,
  last_name: user.last_name,
  full_name: user.full_name,
  role: user.role,
});

const signToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    env.auth.jwtSecret,
    { expiresIn: env.auth.tokenTtl }
  );

export const signUp = async ({ email, password, first_name, middle_name, last_name, role = "applicant", admin_secret }) => {
  if (!email || !password || !first_name || !last_name) {
    throw new AppError("Email, password, first name, and last name are required.", 400, "BAD_REQUEST");
  }

  if (role === "admin" && admin_secret !== env.auth.adminSignupSecret) {
    throw new AppError("Invalid admin secret key.", 403, "INVALID_ADMIN_SECRET");
  }

  if (!['admin', 'applicant'].includes(role)) {
    throw new AppError("Role must be either admin or applicant.", 400, "INVALID_ROLE");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (role === "applicant" && (normalizedEmail.endsWith("@keelworks.org") || normalizedEmail.endsWith("@keelworks.com"))) {
    throw new AppError(
      "This email already belongs to an accepted KeelWorks employee. Please sign up with a personal email address.",
      409,
      "KEELWORKS_EMAIL_NOT_ALLOWED"
    );
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError("Email is already registered.", 409, "DUPLICATE_EMAIL");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const fullName = [first_name, middle_name, last_name]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(" ");

  try {
    const user = await createUser({
      email: normalizedEmail,
      password_hash: passwordHash,
      first_name: first_name.trim(),
      middle_name: middle_name?.trim() || null,
      last_name: last_name.trim(),
      full_name: fullName,
      role,
    });

    return { token: signToken(user), user: publicUser(user) };
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new AppError("Email is already registered.", 409, "DUPLICATE_EMAIL");
    }
    throw error;
  }
};

export const signIn = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required.", 400, "BAD_REQUEST");
  }

  const user = await findActiveUserByEmail(email.trim().toLowerCase());
  if (!user) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  return { token: signToken(user), user: publicUser(user) };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId, {
    attributes: ["user_id", "email", "first_name", "middle_name", "last_name", "full_name", "role", "created_at"],
  });

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  return publicUser(user);
};
