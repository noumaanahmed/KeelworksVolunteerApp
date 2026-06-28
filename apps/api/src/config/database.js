import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const db = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: "mysql",
    logging: env.nodeEnv === "development" ? false : false,
  }
);

export const testDatabaseConnection = async () => {
  await db.authenticate();
  console.log("Database connection established.");
};
