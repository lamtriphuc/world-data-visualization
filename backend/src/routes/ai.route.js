import express from 'express';
import {
	getTravelRecommendations,
	chat,
} from '../controllers/ai.controller.js';

const router = express.Router();

// AI Travel Advisor
router.post('/travel', getTravelRecommendations);

// AI Chat
router.post('/chat', chat);

export default router;
