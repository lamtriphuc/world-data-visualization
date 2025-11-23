// models/Country.js
import mongoose from 'mongoose';

const nameSchema = new mongoose.Schema({
    common: String,
    official: String,
    // nativeName: mongoose.Schema.Types.Mixed // {eng: {official, common}, ...}
}, { _id: false });

const latlngSchema = new mongoose.Schema({
    lat: Number,
    lng: Number
}, { _id: false });

const gdpYearSchema = new mongoose.Schema(
    {
        year: Number,
        value: Number,
    },
    { _id: false }
);

const populationSchema = new mongoose.Schema(
    {
        year: Number,
        value: Number,
    },
    { _id: false }
);

const countrySchema = new mongoose.Schema({
    cca2: { type: String, index: true },
    cca3: { type: String, index: true, unique: true },
    cioc: String,
    name: nameSchema,
    capital: [String],
    region: { type: String, index: true },
    subregion: { type: String, index: true },
    independent: { type: Boolean, index: true, default: false },
    unMember: { type: Boolean, index: true, default: false },
    population: populationSchema,
    area: { type: Number, default: 0 },
    latlng: latlngSchema,
    timezones: [String],
    borders: [String],
    currencies: mongoose.Schema.Types.Mixed,
    languages: mongoose.Schema.Types.Mixed,
    gdp: [gdpYearSchema],
    flags: {
        png: String,
        svg: String
    },
    maps: {
        googleMaps: String,
        openStreetMaps: String
    },
    populationDensity: { type: Number, default: null, index: true },
}, { timestamps: true });

const Country = mongoose.model('Country', countrySchema);
export default Country;