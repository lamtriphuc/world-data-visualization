import { aiTravelService, aiChatService } from '../services/ai.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * AI Travel Advisor Controller
 */
export const getTravelRecommendations = async (req, res) => {
	try {
		const { preferences, lang } = req.body;

		if (!preferences) {
			return errorResponse(res, 'Please provide your travel preferences', 400);
		}

		const result = await aiTravelService(preferences, lang || 'en');

		if (!result.success) {
			return errorResponse(
				res,
				result.error || 'Could not get recommendations',
				400
			);
		}

		return successResponse(res, result, 200, 'Recommendations generated');
	} catch (error) {
		console.error('Travel controller error:', error);
		return errorResponse(res, 'Internal server error', 500);
	}
};

/**
 * AI Chat Controller
 */
export const chat = async (req, res) => {
	try {
		const { question, history, lang } = req.body;

		if (!question) {
			return errorResponse(res, 'Please provide a question', 400);
		}

		const result = await aiChatService(question, history || [], lang || 'en');

		if (!result.success) {
			return errorResponse(
				res,
				result.error || 'Could not process question',
				400
			);
		}

		return successResponse(res, result, 200, 'Response generated');
	} catch (error) {
		console.error('Chat controller error:', error);
		return errorResponse(res, 'Internal server error', 500);
	}
};
