import axios from 'axios';
import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
import Country from '../models/Country.js';
import Region from '../models/Region.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/countriesdb';
const BASE_URL = 'https://restcountries.com/v3.1/all';
const FIELD_GROUPS = [
    'name,cca2,cca3,region,subregion,capital',
    'cca3,population,area,latlng,timezones,borders',
    'cca3,currencies,languages,flags,maps,independent'
];


async function transformAndUpsert(countryRaw) {
    const cca3 = countryRaw.cca3;
    if (!cca3) return;

    const area = countryRaw.area || 0;
    const rawLatLng = countryRaw.latlng || [];

    const doc = {
        cca3,
        cca2: countryRaw.cca2,
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
        population: { year: 2018, value: countryRaw.population },
        flags: countryRaw.flags || {},
        maps: countryRaw.maps || {},
        coatOfArms: countryRaw.coatOfArms || {},
        updatedAt: new Date()
    };

    await Country.findOneAndUpdate({ cca3 }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
}

async function fetchCountries() {
    console.log('Fetching data from rest coutries api...');

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

    const allCountries = Object.values(merged);
    const validCountries = allCountries.filter(c => c.independent === true);

    return validCountries;
}

async function updateAllPopulations() {
    try {
        const defaultYear = 2018;
        const year = process.env.LATEST_YEAR || 2024;

        const url = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=${year}&per_page=500`;
        const { data } = await axios.get(url);

        if (!Array.isArray(data) || !Array.isArray(data[1])) return;

        const records = data[1].filter(r => r.value !== null && r.countryiso3code);

        console.log(`Fetched population records from World Bank (${year})`);

        // Tạo map { CCA3: populationValue }
        const wbPopulationMap = Object.fromEntries(
            records.map(r => [r.countryiso3code, r.value || 0])
        );

        // Lấy danh sách { cca3: area } từ DB trước (để tính mật độ nhanh hơn)
        const countries = await Country.find({}, { cca3: 1, area: 1, population: 1 }).lean();

        // Chuẩn bị bulk operations
        const ops = countries.map(c => {
            const cca3 = c.cca3;
            const wbValue = wbPopulationMap[cca3];
            const hasValidWB = wbValue && wbValue > 0;

            // Dân số hiện có từ REST Countries
            const restPopulationValue = c.population?.value || 0;

            // Chọn dân số cuối cùng (ưu tiên WB)
            const finalPopulation = hasValidWB ? wbValue : restPopulationValue;
            const finalYear = hasValidWB ? Number(year) : defaultYear;

            const area = c.area || 0;
            const populationDensity = area > 0 ? finalPopulation / area : null;

            return {
                updateOne: {
                    filter: { cca3 },
                    update: {
                        $set: {
                            population: { year: finalYear, value: finalPopulation },
                            populationDensity,
                            updatedAt: new Date()
                        }
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
                totalPopulation: { $sum: '$population.value' },
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
                totalPopulation: { $sum: '$population.value' },
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
                        gdp: gdpData
                            .filter(d => !isNaN(d.year) && !isNaN(d.value))
                            .sort((a, b) => a.year - b.year)
                            .slice(-10),
                        updatedAt: new Date(),
                    },
                },
            },
        }));

        if (ops.length > 0) {
            const result = await Country.bulkWrite(ops);
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

        await fetchGdpDataForALl();


        console.log('save success');
    } catch (error) {
        console.log(error.message);
    }
}

export default runScript;