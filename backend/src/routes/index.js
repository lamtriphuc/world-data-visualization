import express from 'express';
import countryRoutes from './country.route.js';
import authRoutes from './auth.route.js'
import regionRoutes from './region.route.js'
import travelRoutes from './travelStatus.routes.js'
import recommendationRoutes from './recommendation.route.js'
import userRoutes from './user.route.js'

const router = express.Router();

router.use('/countries', countryRoutes);
router.use('/auth', authRoutes);
router.use('/region', regionRoutes);
router.use('/travel', travelRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/user', userRoutes);

export default router;