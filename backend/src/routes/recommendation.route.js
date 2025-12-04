import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getRecommendations } from '../controllers/recommendation.controller.js';

const router = express.Router();

router.get('/', verifyToken, getRecommendations);

export default router;