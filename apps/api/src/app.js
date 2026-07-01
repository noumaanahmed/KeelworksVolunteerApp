import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

const allowedOrigins = env.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 100, legacyHeaders: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

if (env.nodeEnv !== "production") {
  app.use((req, res, next) => {
    console.log("[REQ]", req.method, req.originalUrl);
    next();
  });
}

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "KeelWorks Volunteer API",
    health: "/health",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
