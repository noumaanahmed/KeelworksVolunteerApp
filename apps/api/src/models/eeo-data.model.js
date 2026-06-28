import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import Employee from "./employee.model.js";

const EEOData = db.define("EEOData", {
  eeo_data_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: Employee,
      key: "employee_id",
    },
  },
  sexual_orientation: {
    type: DataTypes.ENUM("Heterosexual", "Homosexual", "Bisexual", "Asexual", "Prefer not to say"),
    allowNull: false,
  },
  disability: {
    type: DataTypes.ENUM("Yes", "No", "Prefer not to say"),
    allowNull: false,
  },
  submission_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "EEOData",
  timestamps: false,
});

export default EEOData;
