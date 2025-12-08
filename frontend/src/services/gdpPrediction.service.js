import axios from 'axios';

/**
 * Get GDP prediction for a country
 * @param {string} code - Country code (cca3)
 * @param {string} lang - Language for response ('en' or 'vi')
 * @returns {Object} - { historicalData, predictions, analysis }
 */
export const getGDPPrediction = async (code, lang = 'en') => {
	const response = await axios.get(
		`${import.meta.env.VITE_BACKEND_URL}/api/countries/${code}/gdp-prediction`,
		{ params: { lang } }
	);
	return response.data.data;
};
