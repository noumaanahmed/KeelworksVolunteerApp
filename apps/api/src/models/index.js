import User from "./user.model.js";
import Country from "./country.model.js";
import State from "./state.model.js";
import City from "./city.model.js";
import Address from "./address.model.js";
import Employee from "./employee.model.js";
import Education from "./education.model.js";
import Employment from "./employment.model.js";
import EEOData from "./eeo-data.model.js";
import ApplicationStatusHistory from "./application-status-history.model.js";

User.hasMany(Employee, { foreignKey: "user_id" });
Employee.belongsTo(User, { foreignKey: "user_id" });

Country.hasMany(State, { foreignKey: "country_id" });
State.belongsTo(Country, { foreignKey: "country_id" });

State.hasMany(City, { foreignKey: "state_id" });
City.belongsTo(State, { foreignKey: "state_id" });

City.hasMany(Address, { foreignKey: "city_id" });
Address.belongsTo(City, { foreignKey: "city_id" });

Address.hasMany(Employee, { foreignKey: "address_id" });
Employee.belongsTo(Address, { foreignKey: "address_id" });
Employee.belongsTo(Country, { foreignKey: "country_id" });

Employee.hasMany(Education, { foreignKey: "employee_id" });
Education.belongsTo(Employee, { foreignKey: "employee_id" });

Employee.hasMany(Employment, { foreignKey: "employee_id" });
Employment.belongsTo(Employee, { foreignKey: "employee_id" });

Employee.hasOne(EEOData, { foreignKey: "employee_id" });
EEOData.belongsTo(Employee, { foreignKey: "employee_id" });

Employee.hasMany(ApplicationStatusHistory, {
  foreignKey: "employee_id",
  as: "status_history",
});
ApplicationStatusHistory.belongsTo(Employee, { foreignKey: "employee_id" });

User.hasMany(ApplicationStatusHistory, {
  foreignKey: "changed_by_user_id",
  as: "status_changes",
});
ApplicationStatusHistory.belongsTo(User, {
  foreignKey: "changed_by_user_id",
  as: "changed_by",
});

export {
  User,
  Country,
  State,
  City,
  Address,
  Employee,
  Education,
  Employment,
  EEOData,
  ApplicationStatusHistory,
};
