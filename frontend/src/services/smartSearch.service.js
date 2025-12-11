import axios from 'axios';

/**
 * Smart Search API - AI-powered natural language search
 * @param {string} query - Natural language query
 * @returns {Object} - { countries: [], interpretation: string, total: number }
 */
export const smartSearch = async (query) => {
	const response = await axios.post(
		`${import.meta.env.VITE_BACKEND_URL}/api/search/smart`,
		{ query }
	);
	return response.data.data;
};
