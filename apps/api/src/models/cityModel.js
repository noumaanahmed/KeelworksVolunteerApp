import { DataTypes } from 'sequelize';
import {dbInstance} from '../config/dbConnect.js'; 
import State from './stateModel.js';
const City = dbInstance.define('City', {
  city_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  city_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: State,   
      key: 'state_id',
    },
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['city_name', 'state_id'], // Unique constraint on (city_name, state_id)
    },
  ],
  tableName: 'City',
  timestamps: false, 
});


export default City;
