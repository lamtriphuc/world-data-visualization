import axios from 'axios';
import dotenv from 'dotenv';
import mongoose, { connect } from 'mongoose';
import Country from '../models/Country.js';
import Region from '../models/Region.js';
import { STANDARD_195_CCA3 } from '../constants/countryList.js'

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/countriesdb';
const BASE_URL = 'https://restcountries.com/v3.1/all';
const FIELD_GROUPS = [
    'name,cca2,cca3,region,subregion,capital',
    'cca3,population,area,latlng,timezones,borders',
    'cca3,currencies,languages,flags,maps,independent,unMember'
];

// Danh sách 195 quốc gia chuẩn (193 UN Members + Vatican + Palestine)
// const STANDARD_195_CCA3 = [
//     "AFG", "ALB", "DZA", "AND", "AGO", "ATG", "ARG", "ARM", "AUS", "AUT",
//     "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BTN",
//     "BOL", "BIH", "BWA", "BRA", "BRN", "BGR", "BFA", "BDI", "CPV", "KHM",
//     "CMR", "CAN", "CAF", "TCD", "CHL", "CHN", "COL", "COM", "COG", "CRI",
//     "CIV", "HRV", "CUB", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "COD",
//     "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FJI", "FIN",
//     "FRA", "GAB", "GMB", "GEO", "DEU", "GHA", "GRC", "GRD", "GTM", "GIN",
//     "GNB", "GUY", "HTI", "VAT", "HND", "HUN", "ISL", "IND", "IDN", "IRN",
//     "IRQ", "IRL", "ISR", "ITA", "JAM", "JPN", "JOR", "KAZ", "KEN", "KIR",
//     "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU",
//     "LUX", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MRT", "MUS",
//     "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MAR", "MOZ", "MMR", "NAM",
//     "NRU", "NPL", "NLD", "NZL", "NIC", "NER", "NGA", "PRK", "MKD", "NOR",
//     "OMN", "PAK", "PLW", "PAN", "PNG", "PRY", "PER", "PHL", "POL", "PRT",
//     "QAT", "ROU", "RUS", "RWA", "KNA", "LCA", "WSM", "SMR", "STP", "SAU",
//     "SEN", "SRB", "SYC", "SLE", "SGP", "SVK", "SVN", "SLB", "SOM", "ZAF",
//     "KOR", "SSD", "ESP", "LKA", "VCT", "PSE", "SDN", "SUR", "SWE", "CHE",
//     "SYR", "TJK", "TZA", "THA", "TLS", "TGO", "TON", "TTO", "TUN", "TUR",
//     "TKM", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "URY", "UZB", "VUT",
//     "VEN", "VNM", "YEM", "ZMB", "ZWE"
// ];

async function transformAndUpsert(countryRaw) {
    const cca3 = countryRaw.cca3;
    if (!cca3) return;

    const area = countryRaw.area || 0;
    const rawLatLng = countryRaw.latlng || [];

    const isStandardCountry = STANDARD_195_CCA3.includes(cca3);

    const doc = {
        cca3,
        cca2: countryRaw.cca2,
        cioc: countryRaw.cioc,
        name: {
            common: countryRaw.name?.common,
            official: countryRaw.name?.official,
        },
        capital: countryRaw.capital || [],
        region: countryRaw.region || 'Unknown',
        subregion: countryRaw.subregion || null,
        independent: isStandardCountry,
        unMember: countryRaw.unMember,
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
    // const validCountries = allCountries.filter(c => c.independent === true);

    return allCountries;
}

async function updateAllCountryStats() {
    try {
        const defaultYear = 2018;
        const year = process.env.LATEST_YEAR || 2024;

        const popURL = `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=${year}&per_page=500`;
        const { data: popData } = await axios.get(popURL);

        // if (!Array.isArray(data) || !Array.isArray(data[1])) return;

        const popRecords = Array.isArray(popData) && Array.isArray(popData[1])
            ? popData[1].filter(r => r.value !== null && r.countryiso3code)
            : [];

        // Tạo map { CCA3: populationValue }
        const wbPopulationMap = Object.fromEntries(
            popRecords.map(r => [r.countryiso3code, r.value || 0])
        );
        console.log(`Fetched population records from World Bank (${year})`);


        // 2. Fetch area data
        const areaURL = `https://api.worldbank.org/v2/country/all/indicator/AG.SRF.TOTL.K2?format=json&date=2020&per_page=500`;
        const { data: areaData } = await axios.get(areaURL);

        const areaRecords = Array.isArray(areaData) && Array.isArray(areaData[1])
            ? areaData[1].filter(r => r.value !== null && r.countryiso3code)
            : [];

        const wbAreaMap = Object.fromEntries(
            areaRecords.map(r => [r.countryiso3code, r.value])
        );
        console.log(`Fetched Area (${areaRecords.length} records)`);


        // Lấy countries tư db
        const countries = await Country.find({}, { cca3: 1, area: 1, population: 1 }).lean();

        // bulk update
        const ops = countries.map(c => {
            const cca3 = c.cca3;

            // WB pop
            const wbPop = wbPopulationMap[cca3];
            const popValue = wbPop && wbPop > 0 ? wbPop : (c.population?.value || 0);
            const popYear = wbPop ? Number(year) : defaultYear;

            // WB area
            const wbArea = wbAreaMap[cca3];
            const areaValue = wbArea && wbArea > 0 ? wbArea : (c.area || 0);

            const density = areaValue > 0 ? popValue / areaValue : null;

            return {
                updateOne: {
                    filter: { cca3 },
                    update: {
                        $set: {
                            population: { year: popYear, value: popValue },
                            area: areaValue,
                            populationDensity: density,
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
    const regions = await Country.aggregate([
        {
            $group: {
                _id: '$region',
                totalPopulation: { $sum: '$population.value' },
                totalArea: { $sum: '$area' },
                independentCountryCount: {
                    $sum: {
                        $cond: [{ $in: ['$cca3', STANDARD_195_CCA3] }, 1, 0]
                    }
                },

                dependentTerritoryCount: {
                    $sum: {
                        $cond: [{ $in: ['$cca3', STANDARD_195_CCA3] }, 0, 1]
                    }
                }
            }
        },
        {
            $addFields: {
                populationDensity: {
                    $cond: [
                        { $gt: ['$totalArea', 0] },
                        { $divide: ['$totalPopulation', '$totalArea'] },
                        0
                    ]
                }
            }
        }
    ]);

    for (const r of regions) {
        if (!r._id) continue;
        await Region.findOneAndUpdate(
            { name: r._id },
            {
                name: r._id,
                totalPopulation: r.totalPopulation,
                totalArea: r.totalArea,
                populationDensity: parseFloat(r.populationDensity.toFixed(2)),
                independentCountryCount: r.independentCountryCount,
                dependentTerritoryCount: r.dependentTerritoryCount,
                lastAggregatedAt: new Date()
            },
            { upsert: true, new: true }
        );
    }

    console.log(`Đã tổng hợp ${regions.length} regions theo chuẩn 195 nước.`);
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

        await updateAllCountryStats();

        await aggregateRegionsAndSubregions();

        await fetchGdpDataForALl();


        console.log('save success');
    } catch (error) {
        console.log(error.message);
    }
}

export default runScript;