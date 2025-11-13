import {
    getAllCountriesService,
    getCountryByCodeService,
    getGdpOf10YearService,
    getLastestGdpService,
    getAllCountryNamesService
} from "../services/country.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getAllCountries = async (req, res, next) => {
    try {
        const { region, subregion, search, page, limit } = req.query;
        const data = await getAllCountriesService({ region, subregion, search, page, limit });
        return successResponse(res, data, 200, 'List Countries');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

export const getCountryDetail = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code)
            return errorResponse(res, "Not found code cca2 or cca3", 400);

        const country = await getCountryByCodeService(code);

        if (!country)
            return errorResponse(res, "Not found this country", 404);

        return successResponse(res, country, 200, "Get detail success");
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Interval", 500);
    }
};

export const getLastestGdp = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code)
            return errorResponse(res, "Not found code cca2 or cca3", 400);

        const data = await getLastestGdpService(code);
        return successResponse(res, data, 200, 'Latest GDP');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

export const getGdpOf10Year = async (req, res, next) => {
    try {
        const { code } = req.params;

        if (!code)
            return errorResponse(res, "Not found code cca2 or cca3", 400);

        const data = await getGdpOf10YearService(code);
        return successResponse(res, data, 200, 'GDP of 10 year');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}

export const getAllCountryNames = async (req, res, next) => {
    try {
        const data = await getAllCountryNamesService();
        return successResponse(res, data, 200, 'All country name');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
}