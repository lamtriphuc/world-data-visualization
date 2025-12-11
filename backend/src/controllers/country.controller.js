import {
	getAllCountriesService,
	getCountryByCodeService,
	getGdpOf10YearService,
	getLatestGdpService,
	getAllCountryNamesService,
	getTop10AreaService,
	getTop10PopulationService,
	getLanguageDistributionService,
	getCountriesByListService,
} from '../services/country.service.js';
import { getGlobalStatsService } from '../services/region.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAllCountries = async (req, res, next) => {
	try {
		const { region, subregion, search, page, limit, sortBy, sortOrder, independent } =
			req.query;
		const data = await getAllCountriesService({
			region,
			subregion,
			independent,
			search,
			page,
			limit,
			sortBy,
			sortOrder,
		});
		return successResponse(res, data, 200, 'List Countries');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getCountryDetail = async (req, res) => {
	try {
		const { code } = req.params;

		if (!code) return errorResponse(res, 'Not found code cca2 or cca3', 400);

		const country = await getCountryByCodeService(code);

		if (!country) return errorResponse(res, 'Not found this country', 404);

		return successResponse(res, country, 200, 'Get detail success');
	} catch (error) {
		console.error(error);
		return errorResponse(res, 'Server Interval', 500);
	}
};

export const getLatestGdp = async (req, res, next) => {
	try {
		const { code } = req.params;

		if (!code) return errorResponse(res, 'Not found code cca2 or cca3', 400);

		const data = await getLatestGdpService(code);
		return successResponse(res, data, 200, 'Latest GDP');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getGdpOf10Year = async (req, res, next) => {
	try {
		const { code } = req.params;

		if (!code) return errorResponse(res, 'Not found code cca2 or cca3', 400);

		const data = await getGdpOf10YearService(code);
		return successResponse(res, data, 200, 'GDP of 10 year');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getAllCountryNames = async (req, res, next) => {
	try {
		const data = await getAllCountryNamesService();
		return successResponse(res, data, 200, 'All country name');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getTop10Area = async (req, res, next) => {
	try {
		const { region } = req.query
		const data = await getTop10AreaService(region);
		return successResponse(res, data, 200, 'Top 10 area');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getTop10Population = async (req, res, next) => {
	try {
		const { region } = req.query
		const data = await getTop10PopulationService(region);
		return successResponse(res, data, 200, 'Top 10 population');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getCountriesByList = async (req, res, next) => {
	try {
		const { cca3s } = req.body
		const data = await getCountriesByListService(cca3s);
		return successResponse(res, data, 200, 'List border');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getGlobalStats = async (req, res, next) => {
	try {
		const data = await getGlobalStatsService();
		return successResponse(res, data, 200, 'Global stats fetched');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getDataChart = async (req, res, next) => {
	try {
		const { region } = req.query;
		const data = await getDataChart(region);
		return successResponse(res, data, 200, 'Data for chart');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};

export const getLanguageDistribution = async (req, res, next) => {
	try {
		const { region } = req.query;
		const data = await getLanguageDistributionService(region);
		return successResponse(res, data, 200, 'Language data');
	} catch (error) {
		return errorResponse(res, error.message, 500);
	}
};