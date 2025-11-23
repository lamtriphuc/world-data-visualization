import Country from "../models/Country.js";
import Region from "../models/Region.js";
import { formatCountryBasic } from "../utils/countryFormatter.js";

export const getMax = async (region) => {
    const [area, population] = await Promise.all([
        Country.findOne({ region: region }).sort({ area: -1 }).lean(),
        Country.findOne({ region: region }).sort({ "population.value": -1 }).lean(),
    ])

    const res = {
        maxArea: formatCountryBasic(area),
        maxPopulation: formatCountryBasic(population)
    }

    return res;
};

export const getStatService = async (region) => {
    const regionData = await Region.findOne({ name: region });
    if (!regionData) throw new Error('Region not found');

    return {
        countryCount: regionData.independentCountryCount || 0,
        totalPopulation: regionData.totalPopulation || 0,
        totalArea: regionData.totalArea || 0
    }
};

export const getGlobalStatsService = async () => {
    const stats = await Region.aggregate([
        {
            $group: {
                _id: null,
                totalCountries: { $sum: '$independentCountryCount' },
                totalPopulation: { $sum: '$totalPopulation' },
                totalRegions: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                totalCountries: 1,
                totalPopulation: 1,
                totalRegions: 1
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            totalCountries: 0,
            totalPopulation: 0,
            totalRegions: 0
        };
    }

    return stats[0];
};