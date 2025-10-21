import express from 'express';
import countryRoutes from './country.route.js';
import gdpRoutes from './gdp.route.js';

const router = express.Router();

router.use('/countries', countryRoutes);
router.use('/gdp', gdpRoutes);

export default router;