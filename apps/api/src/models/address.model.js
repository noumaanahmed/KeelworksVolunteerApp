import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import City from "./city.model.js";

const Address = db.define("Address", {
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
    allowNull: true,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: City,
      key: "city_id",
    },
  },
  zip_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: "Address",
  timestamps: false,
});

export default Address;
