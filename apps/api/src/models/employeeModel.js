import { DataTypes } from 'sequelize';
import {dbInstance} from '../config/dbConnect.js'; 
import Address from './addressModel.js';
import Country from './countryModel.js';

const Employee = dbInstance.define('Employee',
  {
    employee_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profile_pic_url: {
      type: DataTypes.STRING(255),
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(50),
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    employee_type: {
      type: DataTypes.ENUM('Paid', 'Not Paid'),
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    linkedin_url: {
      type: DataTypes.STRING(255),
      unique: true,
    },
    personal_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    phonetype: {
      type: DataTypes.ENUM('Mobile', 'Home', 'Work'),
      allowNull: false,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Address,
        key: 'address_id',
      },
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Country,
        key: 'country_id',
      },
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say'),
      allowNull: false,
    },
    opt_support: {
      type: DataTypes.ENUM(
        'Yes, the OPT period has started',
        'Yes, approved but have not received the EAD card',
        'No'
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
    },
    visa_status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    application_status: {
      type: DataTypes.ENUM('Pending', 'Reviewing', 'Approved', 'Rejected'),
      allowNull: false,
    },
    application_date: {
      type: DataTypes.DATE,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
    },
    additional_websites: {
      type: DataTypes.STRING(255),
    },
    additional_info: {
      type: DataTypes.TEXT,
    },
  }, {
  tableName: 'Employee',
  timestamps: false, // Set to true if you have createdAt/updatedAt columns
});

export default Employee;