import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import Employee from "./employee.model.js";

const Education = db.define("Education", {
  education_id: {
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
  institution_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  degree: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  major: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "Education",
  timestamps: false,
});

export default Education;
