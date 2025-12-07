import Country from '../models/Country.js';
import { predictGDP } from '../config/gemini.js';

// In-memory cache for GDP predictions
// Key: countryCode, Value: { data, timestamp }
const predictionCache = new Map();

// Cache TTL: 24 hours (in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (timestamp) => {
	return Date.now() - timestamp < CACHE_TTL;
};

/**
 * GDP Prediction service - uses AI to predict future GDP with caching
 * @param {string} countryCode - Country code (cca3)
 * @returns {Object} - { predictions: [], analysis: string, historicalData: [] }
 */
export const getGDPPrediction = async (countryCode) => {
	const cacheKey = countryCode.toUpperCase();

	// Check cache first
	if (predictionCache.has(cacheKey)) {
		const cached = predictionCache.get(cacheKey);
		if (isCacheValid(cached.timestamp)) {
			console.log(`[GDP Cache] HIT for ${cacheKey}`);
			return {
				...cached.data,
				fromCache: true,
			};
		} else {
			// Cache expired, remove it
			predictionCache.delete(cacheKey);
			console.log(`[GDP Cache] EXPIRED for ${cacheKey}`);
		}
	}

	console.log(`[GDP Cache] MISS for ${cacheKey}, fetching from AI...`);

	// Get country data
	const country = await Country.findOne({ cca3: cacheKey }).lean();

	if (!country) {
		return {
			success: false,
			error: 'Country not found',
		};
	}

	if (!country.gdp || country.gdp.length < 3) {
		return {
			success: false,
			error: 'Insufficient GDP data for prediction (need at least 3 years)',
		};
	}

	// Get last 10 years of GDP data for prediction
	const gdpHistory = country.gdp.filter((g) => g.year && g.value).slice(-10);

	if (gdpHistory.length < 3) {
		return {
			success: false,
			error: 'Insufficient valid GDP data for prediction',
		};
	}

	// Get AI prediction
	const prediction = await predictGDP(country.name.common, gdpHistory);

	if (!prediction.success) {
		return {
			success: false,
			error: prediction.error || 'Prediction failed',
		};
	}

	const result = {
		success: true,
		countryName: country.name.common,
		countryCode: country.cca3,
		historicalData: gdpHistory,
		predictions: prediction.predictions,
		analysis: prediction.analysis,
	};

	// Store in cache
	predictionCache.set(cacheKey, {
		data: result,
		timestamp: Date.now(),
	});
	console.log(`[GDP Cache] STORED for ${cacheKey}`);

	return result;
};

/**
 * Clear cache for a specific country or all
 */
export const clearGDPCache = (countryCode = null) => {
	if (countryCode) {
		predictionCache.delete(countryCode.toUpperCase());
	} else {
		predictionCache.clear();
	}
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
	return {
		size: predictionCache.size,
		keys: Array.from(predictionCache.keys()),
	};
};
