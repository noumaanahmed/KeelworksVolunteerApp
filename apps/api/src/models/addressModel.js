import { DataTypes } from 'sequelize';
import {dbInstance} from '../config/dbConnect.js'; 
import City from './cityModel.js';

const Address = dbInstance.define('Address', {
  address_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  address1: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address2: {
    type: DataTypes.STRING(255),
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: City, 
      key: 'city_id',
    },
  },
  zip_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'Address',
  timestamps: false, 
});

export default Address;
