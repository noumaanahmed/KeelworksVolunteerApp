import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../data/models/userModel.js";

const createResponse = (status, statusCode, message, data = null, error = null) => ({
  status, statusCode, message, data, error,
});

export const signup = async (req, res) => {
  try {
    const { email, password, first_name, middle_name, last_name, role = "applicant", admin_secret } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json(createResponse("error", 400, null, null, "email, password, first name, and last name are required"));
    }

    if (role === "admin") {
      const secret = process.env.ADMIN_SIGNUP_SECRET || "keelworks-admin-2024";
      if (admin_secret !== secret) {
        return res.status(403).json(createResponse("error", 403, null, null, "Invalid admin secret key"));
      }
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json(createResponse("error", 409, null, null, "Email already registered"));
    }

    const password_hash = await bcrypt.hash(password, 12);
    const full_name = [first_name, middle_name, last_name].filter(Boolean).join(" ");

    const user = await User.create({
      email,
      password_hash,
      first_name,
      middle_name: middle_name || null,
      last_name,
      full_name,
      role,
    });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "keelworks_jwt_secret_2024",
      { expiresIn: "8h" }
    );

    return res.status(201).json(createResponse("success", 201, "Account created successfully", {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        full_name: user.full_name,
        role: user.role,
      },
    }));
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json(createResponse("error", 500, "Server error", null, error.message));
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createResponse("error", 400, null, null, "Email and password are required"));
    }

    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) {
      return res.status(401).json(createResponse("error", 401, null, null, "Invalid email or password"));
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json(createResponse("error", 401, null, null, "Invalid email or password"));
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "keelworks_jwt_secret_2024",
      { expiresIn: "8h" }
    );

    return res.status(200).json(createResponse("success", 200, "Signed in successfully", {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        full_name: user.full_name,
        role: user.role,
      },
    }));
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json(createResponse("error", 500, "Server error", null, error.message));
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ["user_id", "email", "first_name", "middle_name", "last_name", "full_name", "role", "created_at"],
    });
    if (!user) return res.status(404).json(createResponse("error", 404, null, null, "User not found"));
    return res.status(200).json(createResponse("success", 200, null, { user }));
  } catch (error) {
    return res.status(500).json(createResponse("error", 500, "Server error", null, error.message));
  }
};
