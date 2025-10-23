import axios from 'axios';

export const getLatestGdp = async (code) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/gdp/${code}`
	);
	return response.data.data;
};
