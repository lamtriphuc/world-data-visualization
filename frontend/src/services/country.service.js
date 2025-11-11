import axios from 'axios';

export const getAllCountries = async ({
	page = 1,
	region = '',
	subregion = '',
	search = '',
	limit = 25,
}) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL
		}/api/countries?page=${page}${region}${subregion}${search}&limit=${limit}`
	);
	return response.data.data;
};

export const getCountryDetails = async (code) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/${code}`
	);
	return response.data.data;
};
