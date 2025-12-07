import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Parse natural language query and return list of country codes using AI knowledge
 * @param {string} userQuery - User's natural language search query
 * @returns {Object} - { countryCodes: string[], interpretation: string }
 */
export async function parseSmartQuery(userQuery) {
	const systemPrompt = `You are a country expert. Given a query about countries, return a list of ISO 3166-1 alpha-3 country codes (cca3) that match the query.

Use your knowledge to answer ANY question about countries, including:
- Political systems (socialist, democratic, monarchy, etc.)
- Economic status (developed, developing, rich, poor)
- Geographic features (islands, landlocked, tropical, etc.)
- Cultural aspects
- Historical facts
- Regional classifications
- And any other country-related queries

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no code blocks
2. Use ISO 3166-1 alpha-3 codes (e.g., "USA", "VNM", "JPN", "CHN")
3. Return relevant countries based on your knowledge
4. For broad queries, limit to 20-30 most relevant countries
5. Understand both English and Vietnamese queries

Response format:
{
  "countryCodes": ["USA", "GBR", "FRA", ...],
  "interpretation": "Brief explanation of the query"
}

Examples:
Query: "socialist countries" or "các quốc gia theo chủ nghĩa xã hội"
Response: {"countryCodes":["CHN","VNM","CUB","LAO","PRK"],"interpretation":"Countries with socialist/communist governments"}

Query: "G7 countries"
Response: {"countryCodes":["USA","GBR","FRA","DEU","ITA","JPN","CAN"],"interpretation":"Group of Seven major advanced economies"}

Query: "Scandinavian countries"
Response: {"countryCodes":["NOR","SWE","DNK","FIN","ISL"],"interpretation":"Nordic/Scandinavian countries"}

Query: "ASEAN members" or "thành viên ASEAN"
Response: {"countryCodes":["BRN","KHM","IDN","LAO","MYS","MMR","PHL","SGP","THA","VNM"],"interpretation":"Association of Southeast Asian Nations member countries"}

Query: "richest countries in Europe"
Response: {"countryCodes":["LUX","CHE","NOR","IRL","ISL","DNK","SWE","NLD","AUT","DEU"],"interpretation":"European countries with highest GDP per capita"}

Query: "countries with monarchy"
Response: {"countryCodes":["GBR","JPN","THA","ESP","BEL","NLD","SWE","NOR","DNK","SAU","JOR","MAR","MYS","BRN","KWT","BHR","QAT","ARE","OMN"],"interpretation":"Countries with monarchical systems"}

Query: "landlocked countries in Asia"
Response: {"countryCodes":["MNG","KAZ","UZB","TKM","KGZ","TJK","AFG","NPL","BTN","LAO"],"interpretation":"Asian countries without ocean coastline"}`;

	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.0-flash',
			contents: userQuery,
			config: {
				systemInstruction: systemPrompt,
			},
		});

		const text = response.text.trim();

		// Clean up response - remove markdown code blocks if present
		let cleanJson = text;
		if (text.startsWith('```')) {
			cleanJson = text
				.replace(/```json?\n?/g, '')
				.replace(/```/g, '')
				.trim();
		}

		const parsed = JSON.parse(cleanJson);
		return {
			success: true,
			countryCodes: parsed.countryCodes || [],
			interpretation: parsed.interpretation || '',
		};
	} catch (error) {
		console.error('Gemini parse error:', error);
		return {
			success: false,
			error: error.message,
			countryCodes: [],
			interpretation: 'Could not understand the query',
		};
	}
}

/**
 * Predict GDP for next 5 years using AI analysis
 * @param {string} countryName - Country name
 * @param {Array} gdpHistory - Historical GDP data [{year, value}, ...]
 * @returns {Object} - { predictions: [{year, value}, ...], analysis: string }
 */
export async function predictGDP(countryName, gdpHistory) {
	const systemPrompt = `You are an economist AI. Given historical GDP data for a country, predict the GDP for the next 5 years.

Use economic analysis considering:
- Historical growth trends
- Regional economic conditions
- Global economic outlook
- Country-specific factors

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no code blocks
2. Predictions should be realistic based on historical trends
3. Values should be in the same unit as input (usually current USD)
4. Provide brief analysis explaining your predictions

Response format:
{
  "predictions": [
    {"year": 2024, "value": 123456789},
    {"year": 2025, "value": 134567890},
    {"year": 2026, "value": 145678901},
    {"year": 2027, "value": 156789012},
    {"year": 2028, "value": 167890123}
  ],
  "analysis": "Brief explanation of the prediction methodology and key factors"
}`;

	const userPrompt = `Country: ${countryName}
Historical GDP data (in current USD):
${gdpHistory.map((g) => `${g.year}: $${g.value.toLocaleString()}`).join('\n')}

Please predict GDP for the next 5 years after the last data point.`;

	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.0-flash',
			contents: userPrompt,
			config: {
				systemInstruction: systemPrompt,
			},
		});

		const text = response.text.trim();

		// Clean up response
		let cleanJson = text;
		if (text.startsWith('```')) {
			cleanJson = text
				.replace(/```json?\n?/g, '')
				.replace(/```/g, '')
				.trim();
		}

		const parsed = JSON.parse(cleanJson);
		return {
			success: true,
			predictions: parsed.predictions || [],
			analysis: parsed.analysis || '',
		};
	} catch (error) {
		console.error('Gemini GDP prediction error:', error);
		return {
			success: false,
			error: error.message,
			predictions: [],
			analysis: 'Could not generate prediction',
		};
	}
}

/**
 * General purpose AI content generation
 */
async function main(prompt) {
	const response = await ai.models.generateContent({
		model: 'gemini-2.0-flash',
		contents: prompt,
	});
	return response.text;
}

export default main;
