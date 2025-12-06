import Country from '../models/Country.js';
import { parseSmartQuery } from '../config/gemini.js';
import { formatCountryBasic } from '../utils/countryFormatter.js';

/**
 * Smart search service - uses AI knowledge to find countries
 * AI returns list of country codes, we fetch those from database
 * @param {string} query - User's natural language query
 * @returns {Object} - { countries: [], interpretation: string, total: number }
 */
export const smartSearchService = async (query) => {
	// Get country codes from AI
	const parsed = await parseSmartQuery(query);

	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error,
			countries: [],
			interpretation: parsed.interpretation,
			total: 0,
		};
	}

	// If no country codes returned
	if (!parsed.countryCodes || parsed.countryCodes.length === 0) {
		return {
			success: true,
			countries: [],
			interpretation:
				parsed.interpretation || 'No countries found for this query',
			total: 0,
			appliedLimit: 0,
		};
	}

	try {
		// Fetch countries by their codes from database
		const countries = await Country.find({
			cca3: { $in: parsed.countryCodes },
		}).lean();

		// Sort countries to match the order from AI response
		const codeOrder = parsed.countryCodes.reduce((acc, code, index) => {
			acc[code] = index;
			return acc;
		}, {});

		countries.sort((a, b) => {
			const orderA = codeOrder[a.cca3] ?? 999;
			const orderB = codeOrder[b.cca3] ?? 999;
			return orderA - orderB;
		});

		const formattedCountries = countries.map((c) => formatCountryBasic(c));

		return {
			success: true,
			countries: formattedCountries,
			interpretation: parsed.interpretation,
			total: formattedCountries.length,
			requestedCodes: parsed.countryCodes.length,
			appliedLimit: formattedCountries.length,
		};
	} catch (error) {
		console.error('Smart search DB error:', error);
		return {
			success: false,
			error: 'Database query failed',
			countries: [],
			interpretation: parsed.interpretation,
			total: 0,
		};
	}
};
