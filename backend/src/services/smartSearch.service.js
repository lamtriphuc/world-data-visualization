import Country from '../models/Country.js';
import { parseSmartQuery } from '../config/gemini.js';
import { formatCountryBasic } from '../utils/countryFormatter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File-based cache for persistence across restarts
const CACHE_FILE = path.join(__dirname, '../../cache/smart-search.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 200;

/**
 * Load cache from file
 */
const loadCache = () => {
	try {
		if (fs.existsSync(CACHE_FILE)) {
			const data = fs.readFileSync(CACHE_FILE, 'utf8');
			return JSON.parse(data);
		}
	} catch (error) {
		console.log(
			'[SmartSearch Cache] Could not load cache file, starting fresh'
		);
	}
	return {};
};

/**
 * Save cache to file
 */
const saveCache = (cache) => {
	try {
		const dir = path.dirname(CACHE_FILE);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
	} catch (error) {
		console.error(
			'[SmartSearch Cache] Could not save cache file:',
			error.message
		);
	}
};

// In-memory cache (loaded from file on startup)
let searchCache = loadCache();

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
 * Smart search service - uses AI knowledge to find countries with persistent caching
 * AI returns list of country codes, we fetch those from database
 * @param {string} query - User's natural language query
 * @returns {Object} - { countries: [], interpretation: string, total: number }
 */
export const smartSearchService = async (query) => {
	const cacheKey = normalizeQuery(query);

	// Check cache first
	if (searchCache[cacheKey]) {
		const cached = searchCache[cacheKey];
		if (isCacheValid(cached.timestamp)) {
			console.log(`[SmartSearch Cache] HIT for "${cacheKey}"`);
			return {
				...cached.data,
				fromCache: true,
			};
		} else {
			// Cache expired, remove it
			delete searchCache[cacheKey];
			saveCache(searchCache);
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

		// Enforce max cache size
		const keys = Object.keys(searchCache);
		if (keys.length >= MAX_CACHE_SIZE) {
			// Remove oldest entries
			const sortedKeys = keys.sort(
				(a, b) => searchCache[a].timestamp - searchCache[b].timestamp
			);
			delete searchCache[sortedKeys[0]];
			console.log(`[SmartSearch Cache] EVICTED oldest entry`);
		}

		// Store in cache (both memory and file)
		searchCache[cacheKey] = {
			data: result,
			timestamp: Date.now(),
		};
		saveCache(searchCache);
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
	searchCache = {};
	saveCache(searchCache);
	console.log('[SmartSearch Cache] CLEARED');
};

/**
 * Get cache stats
 */
export const getSearchCacheStats = () => {
	return {
		size: Object.keys(searchCache).length,
		maxSize: MAX_CACHE_SIZE,
		ttlHours: CACHE_TTL / 3600000,
	};
};
