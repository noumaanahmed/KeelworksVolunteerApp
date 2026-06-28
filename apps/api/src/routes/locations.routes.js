import { Router } from "express";
import { getCities, getCountries, getStates, resolveCityByName } from "../controllers/locations.controller.js";
import { requireJsonBody } from "../middleware/validate-request.middleware.js";

const router = Router();

router.get("/countries", getCountries);
router.get("/states/:countryCode", getStates);
router.get("/cities/:stateId", getCities);
router.post("/cities/resolve", requireJsonBody, resolveCityByName);

export default router;
