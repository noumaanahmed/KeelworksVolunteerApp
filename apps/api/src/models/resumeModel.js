import { DataTypes } from 'sequelize';
import { dbInstance } from '../config/dbConnect.js';
import Employee from './employeeModel.js'; // Import Employee model

const Resume = dbInstance.define('Resume', {
  resume_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Ensures one resume per employee
    references: {
      model: Employee,
      key: 'employee_id',
    },
    onDelete: 'CASCADE', // Deletes resume if the employee is deleted
    onUpdate: 'CASCADE',
  },
  resume_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically set upload date
  },
}, {
  tableName: 'Resume',
  timestamps: false, // Set to true if using createdAt/updatedAt
});

// Establishing Association (One-to-One)
Employee.hasOne(Resume, {
  foreignKey: 'employee_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Resume.belongsTo(Employee, {
  foreignKey: 'employee_id',
});

export default Resume;