import { DataTypes } from "sequelize";
import { db } from "../config/database.js";

const Country = db.define("Country", {
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
  tableName: "Country",
  timestamps: false,
});

export default Country;
