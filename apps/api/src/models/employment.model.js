import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import Employee from "./employee.model.js";

const Employment = db.define("Employment", {
  employment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: "employee_id",
    },
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  job_title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "Employment",
  timestamps: false,
});

export default Employment;
