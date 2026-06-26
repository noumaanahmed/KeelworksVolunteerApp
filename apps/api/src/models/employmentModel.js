import { DataTypes } from 'sequelize';
import { dbInstance } from '../config/dbConnect.js';
import Employee from './employeeModel.js'; 

const Employment = dbInstance.define('Employment', {
  employment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee, // This references the Employee model
      key: 'employee_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE', 
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
  tableName: 'Employment',
  timestamps: false, 
});

Employment.belongsTo(Employee, {
  foreignKey: 'employee_id',
  targetKey: 'employee_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default Employment;
