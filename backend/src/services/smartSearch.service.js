import Country from '../models/Country.js';
import { parseSmartQuery } from '../config/gemini.js';
import { formatCountryBasic } from '../utils/countryFormatter.js';

// In-memory cache for smart search results
// Key: normalized query string, Value: { data, timestamp }
const searchCache = new Map();

// Cache TTL: 1 hour (in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Max cache size to prevent memory issues
const MAX_CACHE_SIZE = 100;

/**
 * Normalize query for cache key (lowercase, trim, remove extra spaces)
 */
const normalizeQuery = (query) => {
	return query.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (timestamp) => {
	return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Smart search service - uses AI knowledge to find countries with caching
 * AI returns list of country codes, we fetch those from database
 * @param {string} query - User's natural language query
 * @returns {Object} - { countries: [], interpretation: string, total: number }
 */
export const smartSearchService = async (query) => {
	const cacheKey = normalizeQuery(query);

	// Check cache first
	if (searchCache.has(cacheKey)) {
		const cached = searchCache.get(cacheKey);
		if (isCacheValid(cached.timestamp)) {
			console.log(`[SmartSearch Cache] HIT for "${cacheKey}"`);
			return {
				...cached.data,
				fromCache: true,
			};
		} else {
			// Cache expired, remove it
			searchCache.delete(cacheKey);
			console.log(`[SmartSearch Cache] EXPIRED for "${cacheKey}"`);
		}
	}

	console.log(`[SmartSearch Cache] MISS for "${cacheKey}", calling AI...`);

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

		const result = {
			success: true,
			countries: formattedCountries,
			interpretation: parsed.interpretation,
			total: formattedCountries.length,
			requestedCodes: parsed.countryCodes.length,
			appliedLimit: formattedCountries.length,
		};

		// Store in cache (with size limit)
		if (searchCache.size >= MAX_CACHE_SIZE) {
			// Remove oldest entry
			const firstKey = searchCache.keys().next().value;
			searchCache.delete(firstKey);
			console.log(`[SmartSearch Cache] EVICTED oldest entry`);
		}

		searchCache.set(cacheKey, {
			data: result,
			timestamp: Date.now(),
		});
		console.log(`[SmartSearch Cache] STORED for "${cacheKey}"`);

		return result;
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

/**
 * Clear smart search cache
 */
export const clearSearchCache = () => {
	searchCache.clear();
	console.log('[SmartSearch Cache] CLEARED');
};

/**
 * Get cache stats
 */
export const getSearchCacheStats = () => {
	return {
		size: searchCache.size,
		maxSize: MAX_CACHE_SIZE,
		ttlMinutes: CACHE_TTL / 60000,
	};
};
