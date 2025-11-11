import express from 'express';
import { getAllCountries, getCountryDetail } from '../controllers/country.controller.js';

const router = express.Router();

// Get all countries
router.get('/', getAllCountries);
router.get('/:code', getCountryDetail);

export default router;