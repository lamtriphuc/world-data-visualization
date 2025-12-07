import { getGDPPrediction } from '../services/gdpPrediction.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * GDP Prediction controller - handles AI-powered GDP prediction requests
 */
export const predictGDP = async (req, res) => {
	try {
		const { code } = req.params;

		if (!code) {
			return errorResponse(res, 'Country code is required', 400);
		}

		const result = await getGDPPrediction(code.toUpperCase());

		if (!result.success) {
			return errorResponse(res, result.error || 'Prediction failed', 400);
		}

		return successResponse(
			res,
			{
				countryName: result.countryName,
				countryCode: result.countryCode,
				historicalData: result.historicalData,
				predictions: result.predictions,
				analysis: result.analysis,
			},
			200,
			'GDP prediction completed'
		);
	} catch (error) {
		console.error('GDP prediction controller error:', error);
		return errorResponse(res, 'Internal server error', 500);
	}
};
