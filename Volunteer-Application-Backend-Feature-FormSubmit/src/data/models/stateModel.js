import { DataTypes } from 'sequelize';
import {dbInstance} from '../../config/dbConnect.js'; 
import Country from './countryModel.js';
const State = dbInstance.define('State', {
  state_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  state_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Country,
      key: 'country_id',
    },
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['state_name', 'country_id'], // Creates a unique key for (state_name, country_id)
    },
  ],
  tableName: 'State',
  timestamps: false, // Set to true if you have createdAt/updatedAt columns
});

export default State;
