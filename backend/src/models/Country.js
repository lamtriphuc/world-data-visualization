// models/Country.js
import mongoose from 'mongoose';

const nameSchema = new mongoose.Schema({
    common: String,
    official: String,
    nativeName: mongoose.Schema.Types.Mixed // {eng: {official, common}, ...}
}, { _id: false });

const latlngSchema = new mongoose.Schema({
    lat: Number,
    lng: Number
}, { _id: false });

const countrySchema = new mongoose.Schema({
    cca2: { type: String, index: true },        // ISO 3166-1 alpha-2
    cca3: { type: String, index: true, unique: true }, // alpha-3
    cioc: String,
    name: nameSchema,
    capital: [String],
    region: { type: String, index: true },      // e.g., "Asia"
    subregion: { type: String, index: true },   // e.g., "South-Eastern Asia"
    population: { type: Number, default: 0, index: true },
    area: { type: Number, default: 0 },         // km2
    latlng: latlngSchema, // [lat, lng]
    timezones: [String],
    borders: [String], // list of cca3 border countries
    currencies: mongoose.Schema.Types.Mixed, // {USD: {name, symbol}, ...}
    languages: mongoose.Schema.Types.Mixed,  // {eng: "English", fra: "French"}
    flags: {
        png: String,
        svg: String
    },
    maps: {
        googleMaps: String,
        openStreetMaps: String
    },
    coatOfArms: mongoose.Schema.Types.Mixed,
    // Computed fields:
    populationDensity: { type: Number, default: null, index: true },
    updatedAt: { type: Date, default: Date.now } // thời điểm cập nhật record
}, { timestamps: true });

const Country = mongoose.model('Country', countrySchema);
export default Country;