import Country from '../models/Country.js';
import { predictGDP } from '../config/gemini.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File-based cache for persistence across restarts
const CACHE_FILE = path.join(__dirname, '../../cache/gdp-predictions.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
		console.log('[GDP Cache] Could not load cache file, starting fresh');
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
		console.error('[GDP Cache] Could not save cache file:', error.message);
	}
};

// In-memory cache (loaded from file on startup)
let predictionCache = loadCache();

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (timestamp) => {
	return Date.now() - timestamp < CACHE_TTL;
};

/**
 * GDP Prediction service - uses AI to predict future GDP with persistent caching
 * @param {string} countryCode - Country code (cca3)
 * @param {string} language - Response language ('en' or 'vi')
 * @returns {Object} - { predictions: [], analysis: string, historicalData: [] }
 */
export const getGDPPrediction = async (countryCode, language = 'en') => {
	const code = countryCode.toUpperCase();
	const cacheKey = `${code}_${language}`;

	// Check cache first
	if (predictionCache[cacheKey]) {
		const cached = predictionCache[cacheKey];
		if (isCacheValid(cached.timestamp)) {
			console.log(`[GDP Cache] HIT for ${cacheKey}`);
			return {
				...cached.data,
				fromCache: true,
			};
		} else {
			// Cache expired, remove it
			delete predictionCache[cacheKey];
			saveCache(predictionCache);
			console.log(`[GDP Cache] EXPIRED for ${cacheKey}`);
		}
	}

	console.log(`[GDP Cache] MISS for ${cacheKey}, fetching from AI...`);

	// Get country data - use code, not cacheKey!
	const country = await Country.findOne({ cca3: code }).lean();

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
	const prediction = await predictGDP(
		country.name.common,
		gdpHistory,
		language
	);

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

	// Store in cache (both memory and file)
	predictionCache[cacheKey] = {
		data: result,
		timestamp: Date.now(),
	};
	saveCache(predictionCache);
	console.log(`[GDP Cache] STORED for ${cacheKey}`);

	return result;
};

/**
 * Clear cache for a specific country or all
 */
export const clearGDPCache = (countryCode = null) => {
	if (countryCode) {
		const keysToDelete = Object.keys(predictionCache).filter((k) =>
			k.startsWith(countryCode.toUpperCase())
		);
		keysToDelete.forEach((k) => delete predictionCache[k]);
	} else {
		predictionCache = {};
	}
	saveCache(predictionCache);
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
	return {
		size: Object.keys(predictionCache).length,
		keys: Object.keys(predictionCache),
	};
};
