import axios from 'axios';

/**
 * Get GDP prediction for a country
 * @param {string} code - Country code (cca3)
 * @returns {Object} - { historicalData, predictions, analysis }
 */
export const getGDPPrediction = async (code) => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/${code}/gdp-prediction`
	);
	return response.data.data;
};
