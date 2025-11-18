import { getMax, getStatService } from "../services/region.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getMaxAreaAndPopulation = async (req, res, next) => {
    try {
        const { region } = req.query;
        const data = await getMax(region);
        return successResponse(res, data, 200, 'Max');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const getStats = async (req, res, next) => {
    try {
        const { region } = req.query;
        const data = await getStatService(region);
        return successResponse(res, data, 200, 'Stats');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};