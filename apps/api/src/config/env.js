import "dotenv/config";

const optional = (name, fallback = "") => process.env[name] || fallback;
const numberFromEnv = (name, fallback) => Number(optional(name, fallback));

// Railway exposes MySQL variables as MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD,
// MYSQLHOST, MYSQLPORT, and sometimes MYSQL_URL / DATABASE_URL.
// Local development continues to use MYSQL_DB_NAME, MYSQL_USERNAME,
// MYSQL_PASSWORD, MYSQL_HOST, and MYSQL_PORT from apps/api/.env.
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  "";

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: numberFromEnv("PORT", "3000"),
  corsOrigin: optional("CORS_ORIGIN", "http://localhost:3001,http://localhost:3002"),
  database: {
    url: databaseUrl,
    name: process.env.MYSQL_DB_NAME || process.env.MYSQLDATABASE,
    user: process.env.MYSQL_USERNAME || process.env.MYSQLUSER,
    password: process.env.MYSQL_PASSWORD ?? process.env.MYSQLPASSWORD ?? "",
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || "localhost",
    port: Number(process.env.MYSQL_PORT || process.env.MYSQLPORT || "3306"),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    adminSignupSecret: process.env.ADMIN_SIGNUP_SECRET,
    tokenTtl: optional("JWT_EXPIRES_IN", "8h"),
  },
  email: {
    user: optional("EMAIL_USER"),
    appPassword: optional("EMAIL_APP_PASSWORD"),
  },
};

export const validateEnv = () => {
  const required = [
    ["JWT_SECRET", env.auth.jwtSecret],
    ["ADMIN_SIGNUP_SECRET", env.auth.adminSignupSecret],
  ];

  if (!env.database.url) {
    required.push(["MYSQL_DB_NAME or MYSQLDATABASE", env.database.name]);
    required.push(["MYSQL_USERNAME or MYSQLUSER", env.database.user]);
    required.push(["MYSQL_HOST or MYSQLHOST", env.database.host]);
    required.push(["MYSQL_PORT or MYSQLPORT", env.database.port]);
  }

  const missing = required
    .filter(([, value]) => value === undefined || value === null || value === "" || Number.isNaN(value))
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
