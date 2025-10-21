import gdpService from "../services/gdp.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

const getLastestGdpByCountry = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code)
            return errorResponse(res, "Not found code cca2 or cca3", 400);

        const data = await gdpService.getLastestGdpByCountry(code);
        return successResponse(res, data, 200, 'Latest GDP');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

const getGdpOf10YearByCountry = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code)
            return errorResponse(res, "Not found code cca2 or cca3", 400);

        const data = await gdpService.getGdpOf10YearByCountry(code);
        return successResponse(res, data, 200, 'GDP of 10 year');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

export default {
    getLastestGdpByCountry,
    getGdpOf10YearByCountry
}