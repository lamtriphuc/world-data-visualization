import express from 'express';
import gdpController from '../controllers/gdp.controller.js';

const router = express.Router();

// Get all countries
router.get('/:code', gdpController.getLastestGdpByCountry);
router.get('/:code/10-year', gdpController.getGdpOf10YearByCountry);

export default router;