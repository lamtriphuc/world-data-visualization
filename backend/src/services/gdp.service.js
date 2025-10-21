import Gdp from '../models/Gdp.js';

const getLastestGdpByCountry = async (cca3) => {
    const gdp = await Gdp.findOne({ cca3: cca3.toUpperCase() }).lean();
    if (!gdp) return null;

    const latest = gdp.data?.length
        ? gdp.data.reduce((a, b) => a.year > b.year ? a : b)
        : null;

    return latest;
}

const getGdpOf10YearByCountry = async (cca3) => {
    const gdps = await Gdp.find({ cca3: cca3.toUpperCase() }).lean();
    return gdps || null;
}

export default {
    getGdpOf10YearByCountry,
    getLastestGdpByCountry
}