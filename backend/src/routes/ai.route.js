import express from 'express';
import {
	getTravelRecommendations,
	chat,
	compare,
} from '../controllers/ai.controller.js';

const router = express.Router();

// AI Travel Advisor
router.post('/travel', getTravelRecommendations);

// AI Chat
router.post('/chat', chat);

// AI Compare
router.post('/compare', compare);

export default router;
