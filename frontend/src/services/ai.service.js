import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/ai`;

/**
 * AI Compare Countries
 * @param {Array} countries - Array of country codes ['USA', 'VNM']
 * @param {string} lang - Language ('en' or 'vi')
 */
export const aiCompareCountries = async (countries, lang = 'en') => {
	const response = await axios.post(`${BASE_URL}/compare`, { countries, lang });
	return response.data.data;
};

/**
 * AI Travel Advisor
 * @param {string} preferences - User's travel preferences text
 * @param {string} lang - Language
 */
export const aiTravelAdvisor = async (preferences, lang = 'en') => {
	const response = await axios.post(`${BASE_URL}/travel`, {
		preferences,
		lang,
	});
	return response.data.data;
};

/**
 * AI Data Insights
 * @param {string} region - Region to analyze (optional)
 * @param {string} metric - Metric to analyze: 'gdp', 'population', 'general'
 * @param {string} lang - Language
 */
export const aiDataInsights = async (
	region = 'all',
	metric = 'general',
	lang = 'en'
) => {
	const response = await axios.get(`${BASE_URL}/insights`, {
		params: { region, metric, lang },
	});
	return response.data.data;
};

/**
 * AI Chat
 * @param {string} question - User's question
 * @param {Array} history - Chat history
 * @param {string} lang - Language
 */
export const aiChat = async (question, history = [], lang = 'en') => {
	const response = await axios.post(`${BASE_URL}/chat`, {
		question,
		history,
		lang,
	});
	return response.data.data;
};
