import mongoose from 'mongoose';

const countryStatsSchema = new mongoose.Schema({
    country: { type: String, ref: 'Country', required: true },
    year: { type: Number, required: true },
    population: Number,
    gdp: Number,
    gdpPerCapita: Number,
    lifeExpectancy: Number
}, { timestamps: true });

const CountryStats = mongoose.model('CountryStats', countryStatsSchema);
export default CountryStats;