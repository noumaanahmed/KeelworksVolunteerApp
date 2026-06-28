import { City, Country, State } from "../models/index.js";

export const getCountries = () =>
  Country.findAll({
    attributes: ["country_id", "country_name", "country_code"],
    order: [["country_name", "ASC"]],
  });

export const getStatesByCountryCode = async (countryCode) => {
  const country = await Country.findOne({ where: { country_code: countryCode } });
  if (!country) return [];

  return State.findAll({
    where: { country_id: country.country_id },
    order: [["state_name", "ASC"]],
  });
};

export const getCitiesByStateId = (stateId) =>
  City.findAll({
    where: { state_id: stateId },
    order: [["city_name", "ASC"]],
  });

export const findCountryById = (countryId) => Country.findByPk(countryId);

export const findStateById = (stateId) => State.findByPk(stateId);

export const findCityById = (cityId) => City.findByPk(cityId);

export const findCityByNameAndState = (cityName, stateId) =>
  City.findOne({ where: { city_name: cityName, state_id: stateId } });

export const createCity = (stateId, cityName) =>
  City.create({ state_id: stateId, city_name: cityName });
