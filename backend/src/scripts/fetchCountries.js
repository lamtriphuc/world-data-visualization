import axios from 'axios';
import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
import Country from '../models/Country.js';
import Region from '../models/Region.js';
import Language from '../models/Language.js';
import Currency from '../models/Currency.js';
import Gdp from '../models/Gdp.js'

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
        area,
        latlng: (rawLatLng.length === 2) ? { lat: rawLatLng[0], lng: rawLatLng[1] } : undefined,
        timezones: countryRaw.timezones || [],
        borders: countryRaw.borders || [],
        currencies: countryRaw.currencies || {},
        languages: countryRaw.languages || {},
        flags: countryRaw.flags || {},
        maps: countryRaw.maps || {},
        coatOfArms: countryRaw.coatOfArms || {},
        updatedAt: new Date()
    };

    await Country.findOneAndUpdate({ cca3 }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
}

async function fetchCountries() {
    console.log('Fetching data from rest coutries api...');

    // for (const group of FIELD_GROUPS) {
    //     const { data } = await axios.get(`${BASE_URL}?fields=${group}`);
    //     results.push(data);
    // }

    const requests = FIELD_GROUPS.map(group =>
        axios.get(`${BASE_URL}?fields=${group}`)
    );

    const response = await Promise.all(requests);
    const results = response.map(res => res.data);

    const merged = results.reduce((acc, group) => {
        for (const c of group) {
            acc[c.cca3] = { ...acc[c.cca3], ...c };
        }
        return acc;
    }, {})

    return Object.values(merged);
}

async function updateAllPopulations() {
    try {
        const year = process.env.LATEST_YEAR || 2024;
        const url = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=${year}&per_page=500`;
        const { data } = await axios.get(url);

        if (!Array.isArray(data) || !Array.isArray(data[1])) return;

        const records = data[1].filter(r => r.value !== null && r.countryiso3code);

        console.log(`Fetched population records from World Bank (${year})`);

        // Lấy danh sách { cca3: area } từ DB trước (để tính mật độ nhanh hơn)
        const areas = await Country.find({}, { cca3: 1, area: 1 }).lean();
        const areaMap = Object.fromEntries(areas.map(c => [c.cca3, c.area || 0]));

        // Chuẩn bị bulk operations
        const ops = records.map(r => {
            const cca3 = r.countryiso3code;
            const population = r.value;
            const area = areaMap[cca3] || 0;
            const populationDensity = area > 0 ? population / area : null;

            return {
                updateOne: {
                    filter: { cca3 },
                    update: {
                        $set: { population, populationDensity, updatedAt: new Date() }
                    }
                }
            };
        });

        if (ops.length > 0) {
            const result = await Country.bulkWrite(ops);
            console.log(`Updated ${result.modifiedCount || 0} countries with population data.`);
        } else {
            console.log("No valid population records to update.");
        }
    } catch (err) {
        console.error("Population batch update failed:", err.message);
    }
}

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

async function fetchGdpDataForALl() {
    const endYear = process.env.LATEST_YEAR || 2015;
    const startYear = endYear - 9;

    try {
        const url = `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&date=${startYear}:${endYear}&per_page=20000`;
        const { data } = await axios.get(url);

        if (!Array.isArray(data) || !Array.isArray(data[1])) return;

        const records = data[1].filter(r => r.value !== null && r.countryiso3code);
        console.log(`Fetched ${records.length} GDP records (${startYear}–${endYear})`);

        const map = {};
        for (const r of records) {
            const code = r.countryiso3code;
            if (!map[code]) map[code] = [];
            map[code].push({
                year: parseInt(r.date),
                value: r.value
            })
        }

        // Chuẩn bị bulk operations
        const ops = Object.entries(map).map(([cca3, gdpData]) => ({
            updateOne: {
                filter: { cca3 },
                update: {
                    $set: {
                        cca3,
                        data: gdpData
                            .filter(d => !isNaN(d.year) && !isNaN(d.value))
                            .sort((a, b) => a.year - b.year)
                            .slice(-10),
                        retrievedAt: new Date(),
                    },
                },
                upsert: true,
            },
        }));

        if (ops.length > 0) {
            const result = await Gdp.bulkWrite(ops);
            console.log(`GDP updated for ${result.modifiedCount + result.upsertedCount} countries`);
        } else {
            console.log("No valid GDP operations to execute");
        }
    } catch (err) {
        console.log(`GDP fetch failed: `, err.message);
    }
}


async function runScript() {
    try {
        console.log('Connect DB to Save data');
        await mongoose.connect(MONGO_URI);

        const countries = await fetchCountries();
        console.log(`Fetched ${countries.length} countries`);

        const BATCH_SIZE = 10;
        for (let i = 0; i < countries.length; i += BATCH_SIZE) {
            const batch = countries.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(c => transformAndUpsert(c)));
        }

        await updateAllPopulations();

        await aggregateRegionsAndSubregions();
        // await aggregateLanguages();
        // await aggregateCurrencies();

        await fetchGdpDataForALl();


        console.log('save success');
        mongoose.disconnect();
    } catch (error) {
        console.log(error.message);
    }
}

export default runScript;