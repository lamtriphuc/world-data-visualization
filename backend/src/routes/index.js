import express from 'express';
import countryRoutes from './country.route.js';
import authRoutes from './auth.route.js';
import regionRoutes from './region.route.js';
import smartSearchRoutes from './smartSearch.route.js';

const router = express.Router();

router.use('/countries', countryRoutes);
router.use('/auth', authRoutes);
router.use('/region', regionRoutes);
router.use('/search', smartSearchRoutes);

export default router;
