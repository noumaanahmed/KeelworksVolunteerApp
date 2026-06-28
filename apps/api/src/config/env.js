import "dotenv/config";

const optional = (name, fallback = "") => process.env[name] || fallback;

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "3000")),
  corsOrigin: optional("CORS_ORIGIN", "http://localhost:3001,http://localhost:3002"),
  database: {
    name: process.env.MYSQL_DB_NAME,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    host: optional("MYSQL_HOST", "localhost"),
    port: Number(optional("MYSQL_PORT", "3306")),
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
    ["MYSQL_DB_NAME", env.database.name],
    ["MYSQL_USERNAME", env.database.user],
    // ["MYSQL_PASSWORD", env.database.password],
    ["JWT_SECRET", env.auth.jwtSecret],
    ["ADMIN_SIGNUP_SECRET", env.auth.adminSignupSecret],
  ];

  const missing = required.filter(([, value]) => !value).map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
