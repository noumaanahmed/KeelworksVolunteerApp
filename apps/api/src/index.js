import express from "express";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import "dotenv/config.js";
import helmet from "helmet";
import rateLimiter from "express-rate-limit";
import { testConnection } from "./config/dbConnect.js";
import cors from "cors";
import constructorMethod from "./routes/index.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 100,
    legacyHeaders: false,
  })
);

// Allow all localhost ports for local development
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.match(/^http:\/\/localhost:\d+$/) ||
      origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)
    ) {
      return callback(null, true);
    }
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  console.log("[REQ]", req.method, req.originalUrl);
  next();
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

constructorMethod(app);

const startApp = async () => {
  try {
    await testConnection();
    app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on http://localhost:${port}/`);
      console.log(`✅ Auth API: http://localhost:${port}/api/v1/auth/signup`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("Check your MySQL credentials in .env");
    process.exit(1);
  }
};

await startApp();