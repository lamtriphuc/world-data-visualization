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
        countryCount: regionData.countryCount || 0,
        totalPopulation: regionData.totalPopulation || 0,
        totalArea: regionData.totalArea || 0
    }
};