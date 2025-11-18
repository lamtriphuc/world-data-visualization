import express from 'express';
import countryRoutes from './country.route.js';
import authRoutes from './auth.route.js'
import regionRoutes from './region.route.js'

const router = express.Router();

router.use('/countries', countryRoutes);
router.use('/auth', authRoutes);
router.use('/region', regionRoutes);

export default router;