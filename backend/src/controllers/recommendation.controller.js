import { getRecommendationsService } from "../services/recommendation.service.js";
import { successResponse, errorResponse } from '../utils/response.js';

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        const recommendations = await getRecommendationsService(userId);

        return successResponse(res, { recommendations }, 200, "Recommendations");
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};