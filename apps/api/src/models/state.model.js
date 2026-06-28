import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import Country from "./country.model.js";

const State = db.define("State", {
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
      key: "country_id",
    },
  },
}, {
  tableName: "State",
  timestamps: false,
});

export default State;
