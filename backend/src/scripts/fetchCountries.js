import axios from 'axios';
import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
import Country from '../models/Country.js';
import Region from '../models/Region.js';
import Language from '../models/Language.js';
import Currency from '../models/Currency.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/countriesdb';
const BASE_URL = 'https://restcountries.com/v3.1/all';
const FIELD_GROUPS = [
    'name,cca2,cca3,region,subregion,capital',
    'cca3,population,area,latlng,timezones,borders',
    'cca3,currencies,languages,flags,maps,coatOfArms'
];


async function transformAndUpsert(countryRaw) {
    const cca3 = countryRaw.cca3;
    if (!cca3) return;

    const area = countryRaw.area || 0;
    const population = countryRaw.population || 0;
    const populationDensity = area > 0 ? population / area : null;
    const rawLatLng = countryRaw.latlng || [];

    const doc = {
        cca2: countryRaw.cca2,
        cca3,
        cioc: countryRaw.cioc,
        name: {
            common: countryRaw.name?.common,
            official: countryRaw.name?.official,
            nativeName: countryRaw.name?.nativeName
        },
        capital: countryRaw.capital || [],
        region: countryRaw.region || 'Unknown',
        subregion: countryRaw.subregion || null,
        population,
        area,
        latlng: (rawLatLng.length === 2) ? { lat: rawLatLng[0], lng: rawLatLng[1] } : undefined,
        timezones: countryRaw.timezones || [],
        borders: countryRaw.borders || [],
        currencies: countryRaw.currencies || {},
        languages: countryRaw.languages || {},
        flags: countryRaw.flags || {},
        maps: countryRaw.maps || {},
        coatOfArms: countryRaw.coatOfArms || {},
        populationDensity,
        updatedAt: new Date()
    };

    await Country.findOneAndUpdate({ cca3 }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
}

async function fetchCountries() {
    const results = [];
    console.log('Đang fetch dữ liệu từ API...');

    for (const group of FIELD_GROUPS) {
        const { data } = await axios.get(`${BASE_URL}?fields=${group}`);
        results.push(data);
    }

    console.log('Đang gộp dữ liệu...');
    const merged = {};
    for (const group of results) {
        for (const c of group) {
            const key = c.cca3
            merged[key] = { ...merged[key], ...c };
        }
    }

    return Object.values(merged);
}

// async function aggregateRegions() {
//     const regions = await Country.aggregate([
//         {
//             $group: {
//                 _id: '$region',
//                 totalPopulation: { $sum: '$population' },
//                 totalArea: { $sum: '$area' },
//                 averagePopulationDensity: { $avg: '$populationDensity' },
//                 countryCount: { $sum: 1 }
//             }
//         }
//     ]);

//     for (const r of regions) {
//         await Region.findOneAndUpdate(
//             { name: r._id, type: 'region' },
//             {
//                 name: r._id,
//                 type: 'region',
//                 totalPopulation: r.totalPopulation,
//                 totalArea: r.totalArea,
//                 averagePopulationDensity: r.averagePopulationDensity,
//                 countryCount: r.countryCount,
//                 lastAggregatedAt: new Date()
//             },
//             { upsert: true, new: true }
//         );
//     }
//     console.log(`Đã tổng hợp ${regions.length} regions.`);
// }

async function aggregateRegionsAndSubregions() {
    // ----- Tổng hợp theo region -----
    const regions = await Country.aggregate([
        {
            $group: {
                _id: '$region',
                totalPopulation: { $sum: '$population' },
                totalArea: { $sum: '$area' },
                averagePopulationDensity: { $avg: '$populationDensity' },
                countryCount: { $sum: 1 }
            }
        }
    ]);

    for (const r of regions) {
        if (!r._id) continue;
        await Region.findOneAndUpdate(
            { name: r._id, type: 'region' },
            {
                name: r._id,
                type: 'region',
                totalPopulation: r.totalPopulation,
                totalArea: r.totalArea,
                averagePopulationDensity: r.averagePopulationDensity,
                countryCount: r.countryCount,
                lastAggregatedAt: new Date()
            },
            { upsert: true, new: true }
        );
    }

    console.log(`Đã tổng hợp ${regions.length} regions.`);

    // ----- Tổng hợp theo subregion -----
    const subregions = await Country.aggregate([
        {
            $group: {
                _id: { region: '$region', subregion: '$subregion' },
                totalPopulation: { $sum: '$population' },
                totalArea: { $sum: '$area' },
                averagePopulationDensity: { $avg: '$populationDensity' },
                countryCount: { $sum: 1 }
            }
        }
    ]);

    for (const s of subregions) {
        if (!s._id.subregion) continue; // skip nếu subregion null

        await Region.findOneAndUpdate(
            { name: s._id.subregion, type: 'subregion' },
            {
                name: s._id.subregion,
                type: 'subregion',
                parentRegion: s._id.region || null,
                totalPopulation: s.totalPopulation,
                totalArea: s.totalArea,
                averagePopulationDensity: s.averagePopulationDensity,
                countryCount: s.countryCount,
                lastAggregatedAt: new Date()
            },
            { upsert: true, new: true }
        );
    }

    console.log(`Đã tổng hợp ${subregions.length} subregions.`);
}


async function aggregateLanguages() {
    const countries = await Country.find();
    const langMap = {};

    for (const c of countries) {
        if (!c.languages) continue;
        for (const [code, name] of Object.entries(c.languages)) {
            if (!langMap[code]) langMap[code] = { name, countries: [] };
            langMap[code].countries.push(c.cca3);
        }
    }

    for (const [code, val] of Object.entries(langMap)) {
        await Language.findOneAndUpdate(
            { code },
            {
                code,
                name: val.name,
                countries: val.countries,
                countryCount: val.countries.length
            },
            { upsert: true, new: true }
        );
    }
    console.log(`Đã lưu ${Object.keys(langMap).length} languages.`);
}

async function aggregateCurrencies() {
    const countries = await Country.find();
    const curMap = {};

    for (const c of countries) {
        if (!c.currencies) continue;
        for (const [code, info] of Object.entries(c.currencies)) {
            if (!curMap[code])
                curMap[code] = {
                    name: info?.name || '',
                    symbol: info?.symbol || '',
                    countries: []
                };
            curMap[code].countries.push(c.cca3);
        }
    }

    for (const [code, val] of Object.entries(curMap)) {
        await Currency.findOneAndUpdate(
            { code },
            {
                code,
                name: val.name,
                symbol: val.symbol,
                countries: val.countries,
                countryCount: val.countries.length
            },
            { upsert: true, new: true }
        );
    }
    console.log(`Đã lưu ${Object.keys(curMap).length} currencies.`);
}


async function runScript() {
    try {
        console.log('Connect DB to Save data');
        await mongoose.connect(MONGO_URI);

        const countries = await fetchCountries();
        console.log(`Fetched ${countries.length} countries`);

        for (const c of countries) {
            await transformAndUpsert(c);
        }

        // await aggregateRegions();
        await aggregateRegionsAndSubregions();
        await aggregateLanguages();
        await aggregateCurrencies();

        console.log('save success');
        mongoose.disconnect();
    } catch (error) {
        console.log(error.message);
    }
}

export default runScript;