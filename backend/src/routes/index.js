import express from 'express';
import countryRoutes from './country.route.js';
import gdpRoutes from './gdp.route.js';
import authRoutes from './auth.route.js'

const router = express.Router();

router.use('/countries', countryRoutes);
router.use('/gdp', gdpRoutes);
router.use('/auth', authRoutes);

export default router;