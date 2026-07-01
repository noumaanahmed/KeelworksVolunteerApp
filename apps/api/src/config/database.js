import { Sequelize } from "sequelize";
import { env } from "./env.js";

const commonOptions = {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    decimalNumbers: true,
  },
};

export const db = env.database.url
  ? new Sequelize(env.database.url, commonOptions)
  : new Sequelize(env.database.name, env.database.user, env.database.password, {
      ...commonOptions,
      host: env.database.host,
      port: env.database.port,
    });

export const testDatabaseConnection = async () => {
  await db.authenticate();
  console.log("Database connection established.");
};
