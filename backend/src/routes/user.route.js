import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import travelRoutes from './travelStatus.routes.js';

const router = express.Router();

router.use('/travel', verifyToken, travelRoutes);

export default router;