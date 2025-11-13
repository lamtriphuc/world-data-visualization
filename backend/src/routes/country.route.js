import express from 'express';
import {
    getAllCountries,
    getCountryDetail,
    getGdpOf10Year,
    getLastestGdp,
    getAllCountryNames
} from '../controllers/country.controller.js';

const router = express.Router();

// Get all countries
router.get('/', getAllCountries);
router.get('/list-name', getAllCountryNames);
router.get('/:code', getCountryDetail);
router.get('/gdp/:code', getLastestGdp);
router.get('/gdp/:code/10-year', getGdpOf10Year);

export default router;