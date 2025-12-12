import express from 'express';
import {
	getAllCountries,
	getCountryDetail,
	getGdpOf10Year,
	getLatestGdp,
	getAllCountryNames,
	getTop10Area,
	getTop10Population,
	getGlobalStats,
	getLanguageDistribution,
	getCountriesByList,
} from '../controllers/country.controller.js';
import { predictGDP } from '../controllers/gdpPrediction.controller.js';

const router = express.Router();

router.get('/', getAllCountries);
router.get('/list-name', getAllCountryNames);
router.get('/top-10-area', getTop10Area);
router.get('/top-10-population', getTop10Population);
router.get('/stats', getGlobalStats);
router.get('/language', getLanguageDistribution);
router.get('/border', getCountriesByList);

router.get('/:code', getCountryDetail);
router.get('/gdp/:code', getLatestGdp);
router.get('/gdp/:code/10-year', getGdpOf10Year);
router.get('/:code/gdp-prediction', predictGDP);

export default router;
