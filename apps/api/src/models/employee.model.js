import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import User from "./user.model.js";
import Address from "./address.model.js";
import Country from "./country.model.js";
import { APPLICATION_STATUS } from "../constants/application-status.js";

const Employee = db.define("Employee", {
  employee_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "user_id",
    },
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  middle_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  employee_type: {
    type: DataTypes.ENUM("Paid", "Not Paid"),
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  linkedin_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  personal_email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  phonetype: {
    type: DataTypes.ENUM("Mobile", "Home", "Work"),
    allowNull: false,
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Address,
      key: "address_id",
    },
  },
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Country,
      key: "country_id",
    },
  },
  gender: {
    type: DataTypes.ENUM("Male", "Female", "Non-binary", "Prefer not to say"),
    allowNull: false,
  },
  opt_support: {
    type: DataTypes.ENUM(
      "Yes, the OPT period has started",
      "Yes, approved but have not received the EAD card",
      "No"
    ),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hours_commitment: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  why_kworks: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  interested_role: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  time_zone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  visa_status: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  application_status: {
    type: DataTypes.ENUM(...Object.values(APPLICATION_STATUS)),
    allowNull: false,
    defaultValue: APPLICATION_STATUS.SUBMITTED,
  },
  application_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  additional_websites: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  additional_info: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "Employee",
  timestamps: false,
});

export default Employee;
