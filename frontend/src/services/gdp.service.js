import axios from 'axios';

export const getLatestGdp = async (code) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/gdp/${code}`
	);
	return response.data.data;
};

export const getGdpOf10Years = async (code) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/gdp/${code}/10-years`
	);
	return response.data.data;
};
