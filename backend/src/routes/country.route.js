import express from 'express';
import countryController from '../controllers/country.controller.js';

const router = express.Router();

// Get all countries
router.get('/', countryController.getAllCountries);
router.get('/:code', countryController.getCountryDetail);

export default router;