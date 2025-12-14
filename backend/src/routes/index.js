import express from 'express';
import countryRoutes from './country.route.js';
import authRoutes from './auth.route.js';
import regionRoutes from './region.route.js';
import recommendationRoutes from './recommendation.route.js';
import userRoutes from './user.route.js';
import smartSearchRoutes from './smartSearch.route.js';
import aiRoutes from './ai.route.js';
import mlRoutes from './ml.route.js';

const router = express.Router();

router.use('/countries', countryRoutes);
router.use('/auth', authRoutes);
router.use('/region', regionRoutes);
router.use('/search', smartSearchRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/user', userRoutes);
router.use('/ai', aiRoutes);
router.use('/ml', mlRoutes);

export default router;
