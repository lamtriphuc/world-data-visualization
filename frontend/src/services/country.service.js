import axios from 'axios';

export const getAllCountries = async (page, region, subregion, search) => {
	const response = await axios.get(
		`${
			import.meta.env.VITE_BACKEND_URL
		}/api/countries?page=${page}${region}${subregion}${search}`
	);
	return response.data.data;
};
