import { DataTypes } from 'sequelize';
import {dbInstance} from '../../config/dbConnect.js'; 

const Country = dbInstance.define('Country', {
  country_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  country_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  country_code: {
    type: DataTypes.STRING(2),
    allowNull: false,
    unique: true,
  },
  country_code_phone: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
}, {
  indexes: [
    {
      fields: ['country_code_phone'], // Index on country_code_phone field
    },
  ],
  tableName: 'Country',
  timestamps: false, // Set to true if you have createdAt/updatedAt columns
});

export default Country;
