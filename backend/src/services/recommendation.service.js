import Country from '../models/Country.js'
import UserCountryStatus from "../models/UserCountryStatus.js";

export const getRecommendationsService = async (userId) => {
    // lấy danh sách bucket list
    const bucket = await UserCountryStatus.find({
        userId,
        status: "bucket"
    }).lean();

    if (bucket.length === 0) {
        return [];
    }

    const allCountries = await Country.find({});

    let scoreMap = {};

    for (const item of bucket) {
        const src = allCountries.find(c => c.cca3 === item.countryCode);
        if (!src) continue;

        for (const target of allCountries) {
            if (!target.cca3 || target.cca3 === src.cca3) continue;

            const score = similarityScore(src, target);
            if (score > 0) {
                if (!scoreMap[target.cca3]) scoreMap[target.cca3] = 0;
                scoreMap[target.cca3] += score;
            }
        }
    }

    const rankedCca3 = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .map(([cca3]) => cca3)
        .slice(0, 20);

    const results = allCountries.filter(c => rankedCca3.includes(c.cca3));

    return allCountries.filter((c) => topCca3.includes(c.cca3));
};