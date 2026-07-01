import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import Employee from "./employee.model.js";
import User from "./user.model.js";
import { APPLICATION_STATUS } from "../constants/application-status.js";

const ApplicationStatusHistory = db.define("ApplicationStatusHistory", {
  history_id: {
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
  previous_status: {
    type: DataTypes.ENUM(...Object.values(APPLICATION_STATUS)),
    allowNull: true,
  },
  new_status: {
    type: DataTypes.ENUM(...Object.values(APPLICATION_STATUS)),
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  forwarded_to: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  action_label: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  changed_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "user_id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "ApplicationStatusHistory",
  timestamps: false,
});

export default ApplicationStatusHistory;
