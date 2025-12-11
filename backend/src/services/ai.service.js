import { travelAdvisor, chat, compareCountries } from '../config/gemini.js';
import Country from '../models/Country.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache files
const CACHE_DIR = path.join(__dirname, '../../cache');
const TRAVEL_CACHE_FILE = path.join(CACHE_DIR, 'travel-advisor.json');
const CHAT_CACHE_FILE = path.join(CACHE_DIR, 'chat.json');
const COMPARE_CACHE_FILE = path.join(CACHE_DIR, 'compare.json');
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Utility functions
const loadCache = (file) => {
	try {
		if (fs.existsSync(file)) {
			return JSON.parse(fs.readFileSync(file, 'utf8'));
		}
	} catch (e) {
		/* ignore */
	}
	return {};
};

const saveCache = (file, cache) => {
	try {
		if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
		fs.writeFileSync(file, JSON.stringify(cache, null, 2));
	} catch (e) {
		console.error('Cache save error:', e.message);
	}
};

let travelCache = loadCache(TRAVEL_CACHE_FILE);
let chatCache = loadCache(CHAT_CACHE_FILE);
let compareCache = loadCache(COMPARE_CACHE_FILE);

/**
 * AI Travel Advisor Service
 */
export const aiTravelService = async (preferences, language = 'en') => {
	const cacheKey = `${preferences.toLowerCase().trim()}_${language}`;

	// Check cache
	if (
		travelCache[cacheKey] &&
		Date.now() - travelCache[cacheKey].timestamp < CACHE_TTL
	) {
		console.log('[Travel Cache] HIT');
		return { ...travelCache[cacheKey].data, fromCache: true };
	}

	const result = await travelAdvisor(preferences, language);

	if (result.success) {
		// Enrich with country data from DB
		const codes = result.recommendations?.map((r) => r.countryCode) || [];
		const countries = await Country.find({ cca3: { $in: codes } }).lean();

		result.recommendations = result.recommendations?.map((rec) => {
			const country = countries.find((c) => c.cca3 === rec.countryCode);
			return {
				...rec,
				flag: country?.flags?.svg || country?.flags?.png,
				population: country?.population,
				region: country?.region,
			};
		});

		// Save to cache
		travelCache[cacheKey] = { data: result, timestamp: Date.now() };
		saveCache(TRAVEL_CACHE_FILE, travelCache);
	}

	return result;
};

/**
 * AI Chat Service
 */
export const aiChatService = async (
	question,
	history = [],
	language = 'en'
) => {
	const cacheKey = `${question.toLowerCase().trim()}_${language}`;

	// Only cache for simple questions (no history context)
	if (
		history.length === 0 &&
		chatCache[cacheKey] &&
		Date.now() - chatCache[cacheKey].timestamp < CACHE_TTL
	) {
		console.log('[Chat Cache] HIT');
		return { ...chatCache[cacheKey].data, fromCache: true };
	}

	const result = await chat(question, history, language);

	if (result.success && history.length === 0) {
		// Enrich with country data if related countries mentioned
		if (result.relatedCountries?.length > 0) {
			const countries = await Country.find({
				cca3: { $in: result.relatedCountries },
			}).lean();
			result.countriesData = countries.map((c) => ({
				code: c.cca3,
				name: c.name?.common,
				flag: c.flags?.svg || c.flags?.png,
			}));
		}

		// Cache simple questions
		chatCache[cacheKey] = { data: result, timestamp: Date.now() };
		saveCache(CHAT_CACHE_FILE, chatCache);
	}

	return result;
};
/**
 * AI Compare Service
 */
export const aiCompareService = async (countryCodes, language = 'en') => {
	try {
		// Create a unique cache key based on sorted country codes
		const sortedCodes = [...countryCodes].sort().join('-');
		const cacheKey = `${sortedCodes}_${language}`;

		// Check cache
		if (
			compareCache[cacheKey] &&
			Date.now() - compareCache[cacheKey].timestamp < CACHE_TTL
		) {
			console.log('[Compare Cache] HIT');
			return { ...compareCache[cacheKey].data, fromCache: true };
		}

		// Fetch country data
		const countries = await Country.find({
			cca3: { $in: countryCodes },
		}).lean();

		if (!countries.length) {
			return { success: false, error: 'Countries not found' };
		}

		// Format data for AI
		const formattedData = countries.map((c) => ({
			name: c.name.common,
			population: c.population?.value || 0,
			area: c.area || 0,
			region: c.region,
			gdp: c.gdp?.length
				? c.gdp.reduce((a, b) => (a.year > b.year ? a : b))?.value
				: 'N/A',
			populationDensity: c.populationDensity,
		}));

		const result = await compareCountries(formattedData, language);

		if (result.success) {
			// Save to cache
			compareCache[cacheKey] = { data: result, timestamp: Date.now() };
			saveCache(COMPARE_CACHE_FILE, compareCache);
		}

		return result;
	} catch (error) {
		console.error('AI Compare Service error:', error);
		return { success: false, error: error.message };
	}
};
