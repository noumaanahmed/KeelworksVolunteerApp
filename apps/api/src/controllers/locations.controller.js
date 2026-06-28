import {
  listCitiesByStateId,
  listCountries,
  listStatesByCountryCode,
  resolveCity,
} from "../services/locations.service.js";
import { successResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getCountries = asyncHandler(async (req, res) => {
  const countries = await listCountries();
  return res.status(200).json(successResponse("Countries retrieved.", countries));
});

export const getStates = asyncHandler(async (req, res) => {
  const states = await listStatesByCountryCode(req.params.countryCode);
  return res.status(200).json(successResponse("States retrieved.", states));
});

export const getCities = asyncHandler(async (req, res) => {
  const cities = await listCitiesByStateId(req.params.stateId);
  return res.status(200).json(successResponse("Cities retrieved.", cities));
});

export const resolveCityByName = asyncHandler(async (req, res) => {
  const city = await resolveCity(req.body);
  return res.status(200).json(successResponse("City resolved.", city));
});
