import axios from 'axios';

export const getAllCountries = async ({
	page = 1,
	region = '',
	subregion = '',
	search = '',
	limit = 25,
	sortBy = '',
	sortOrder = '',
}) => {
	const response = await axios.get(
		`${
			import.meta.env.VITE_BACKEND_URL
		}/api/countries?page=${page}${region}${subregion}${search}&limit=${limit}${sortBy}${sortOrder}`
	);
	return response.data.data;
};

export const getAllCountriesContinent = async ({
	region = 'Asia',
	limit = 150,
	independent = true,
	sortBy = 'name',
	sortOrder = 1,
}) => {
	const url = `${
		import.meta.env.VITE_BACKEND_URL
	}/api/countries?region=${region}&independent=${independent}&limit=${limit}&sortBy=${sortBy}&sortOrder=${Number(
		sortOrder
	)}`;
	const response = await axios.get(url);
	return response.data.data;
};

export const getMax = async (region) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/region/max?region=${region}`
	);
	return response.data.data;
};

export const getStats = async (region) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/region/stats?region=${region}`
	);
	return response.data.data;
};

export const getCountryDetails = async (code) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/${code}`
	);
	return response.data.data;
};

export const getAllCountryNames = async () => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/list-name`
	);
	return response.data.data;
};

export const getTop10Area = async (region = '') => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/top-10-area`,
		{ params: { region } }
	);
	return response.data.data;
};

export const getTop10Population = async (region = '') => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/top-10-population`,
		{ params: { region } }
	);
	return response.data.data;
};

export const getGlobalStats = async () => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/stats`
	);
	return response.data.data;
};

export const getTopLanguages = async (region) => {
	const params = {};
	if (region) params.region = region;
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/language`,
		{ params }
	);
	return response.data.data;
};

export const getTop10Borders = async () => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/top-10-borders`
	);
	return response.data.data;
};
