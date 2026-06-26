import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: "error", statusCode: 401, error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "keelworks_jwt_secret_2024");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ status: "error", statusCode: 403, error: "Invalid or expired token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", statusCode: 403, error: "Admin access required" });
  }
  next();
};

export default verifyToken;