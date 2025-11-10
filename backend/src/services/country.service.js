import Country from '../models/Country.js';
import { formatCountryBasic, formatCountryDetail } from '../utils/countryFormatter.js';

const getAllCountries = async ({ region, subregion, search, page = 1, limit = 25 }) => {
    const query = {};

    if (region) query.region = region;
    if (subregion) query.subregion = subregion;
    if (search) {
        query.$or = [
            { 'name.common': { $regex: search, $options: 'i' } },
            { 'name.official': { $regex: search, $options: 'i' } },
            { cca2: { $regex: search, $options: 'i' } },
            { cca3: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const [countries, total] = await Promise.all([
        Country.find(query)
            .sort({ 'name.common': 1 })
            .skip(skip)
            .limit(Number(limit)),
        Country.countDocuments(query)
    ]);

    const response = countries.map(c => formatCountryBasic(c));

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: response
    }
}

const getCountryByCode = async (code) => {
    const country = await Country.findOne({
        $or: [
            { cca3: code.toUpperCase() },
            { cca2: code.toUpperCase() },
        ],
    });

    return formatCountryDetail(country);
};

export default {
    getAllCountries,
    getCountryByCode
};