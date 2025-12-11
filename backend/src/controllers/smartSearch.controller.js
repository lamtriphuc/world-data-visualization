import { smartSearchService } from '../services/smartSearch.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Smart search controller - handles AI-powered search requests
 */
export const smartSearch = async (req, res) => {
	try {
		const body = req.body || {};
		const { query } = body;

		if (!query || typeof query !== 'string' || query.trim().length === 0) {
			return errorResponse(res, 'Query is required', 400);
		}

		const result = await smartSearchService(query.trim());

		if (!result.success) {
			return errorResponse(res, result.error || 'Search failed', 500);
		}

		return successResponse(
			res,
			{
				countries: result.countries,
				interpretation: result.interpretation,
				total: result.total,
			},
			200,
			'Smart search completed'
		);
	} catch (error) {
		console.error('Smart search controller error:', error);
		return errorResponse(res, 'Internal server error', 500);
	}
};
