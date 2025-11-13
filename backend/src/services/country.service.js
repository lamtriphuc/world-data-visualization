import Country from '../models/Country.js';
import { formatCountryBasic, formatCountryDetail, formatCountryName } from '../utils/countryFormatter.js';

export const getAllCountriesService = async ({ region, subregion, search, page = 1, limit = 25 }) => {
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

export const getCountryByCodeService = async (code) => {
    const country = await Country.findOne({
        $or: [
            { cca3: code.toUpperCase() },
            { cca2: code.toUpperCase() },
        ],
    });

    return formatCountryDetail(country);
};

export const getCountriesByListService = async (listCode) => {
    const res = await Country.find({
        cca3: { $in: listCode },
    });

    return res.map(c => formatCountryBasic(c));
}

export const getLastestGdpService = async (cca3) => {
    const country = await Country.findOne({ cca3: cca3.toUpperCase() }).lean();
    if (!country) return null;

    const latest = country.gdp.length
        ? country.gdp.reduce((a, b) => a.year > b.year ? a : b)
        : null;

    return latest;
}

export const getGdpOf10YearService = async (cca3) => {
    const country = await Country.find({ cca3: cca3.toUpperCase() }).lean();
    return country.gdp || null;
}

export const getAllCountryNamesService = async () => {
    const contries = await Country.find();
    const res = contries.map(c => formatCountryName(c))

    return res;
}