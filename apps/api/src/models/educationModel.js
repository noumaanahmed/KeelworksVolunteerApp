import { DataTypes } from 'sequelize';
import {dbInstance} from '../config/dbConnect.js'; 
import Employee from './employeeModel.js';

const Education = dbInstance.define('Education', {
  education_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee, // References the Employee table
      key: 'employee_id',
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
  },
}, {
  tableName: 'Education',
  timestamps: false, // Set to true if you have createdAt/updatedAt columns
});

export default Education;