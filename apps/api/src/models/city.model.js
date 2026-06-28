import { DataTypes } from "sequelize";
import { db } from "../config/database.js";
import State from "./state.model.js";

const City = db.define("City", {
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
      key: "state_id",
    },
  },
}, {
  tableName: "City",
  timestamps: false,
  indexes: [{ unique: true, fields: ["city_name", "state_id"] }],
});

export default City;
