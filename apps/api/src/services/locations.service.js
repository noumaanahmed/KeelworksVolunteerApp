import { AppError } from "../utils/app-error.js";
import {
  createCity,
  findCityById,
  findCityByNameAndState,
  findCountryById,
  findStateById,
  getCitiesByStateId,
  getCountries,
  getStatesByCountryCode,
} from "../repositories/locations.repository.js";
import { validateCityResolution } from "../validators/application.validator.js";

export const listCountries = () => getCountries();

export const listStatesByCountryCode = async (countryCode) => {
  const states = await getStatesByCountryCode(countryCode);
  if (!states.length) {
    throw new AppError("Country code not found.", 404, "COUNTRY_NOT_FOUND");
  }
  return states;
};

export const listCitiesByStateId = async (stateId) => {
  const state = await findStateById(Number(stateId));
  if (!state) {
    throw new AppError("State not found.", 404, "STATE_NOT_FOUND");
  }

  return getCitiesByStateId(Number(stateId));
};

export const assertLocationReferencesExist = async ({ cityId, countryId }) => {
  const [city, country] = await Promise.all([
    findCityById(Number(cityId)),
    findCountryById(Number(countryId)),
  ]);

  if (!city) throw new AppError("City not found.", 404, "CITY_NOT_FOUND");
  if (!country) throw new AppError("Country not found.", 404, "COUNTRY_NOT_FOUND");
};

export const resolveCity = async (payload) => {
  const { stateId, cityName } = validateCityResolution(payload);
  const state = await findStateById(stateId);
  if (!state) {
    throw new AppError("State not found.", 404, "STATE_NOT_FOUND");
  }

  const normalizedCityName = cityName.trim();
  const existingCity = await findCityByNameAndState(normalizedCityName, stateId);
  if (existingCity) return existingCity;

  return createCity(stateId, normalizedCityName);
};
