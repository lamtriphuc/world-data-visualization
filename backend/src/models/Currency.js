import mongoose from 'mongoose';

const currencySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // USD, VND, EUR...
    name: String,
    symbol: String,
    countries: [String],
    countryCount: Number
}, { timestamps: true });

const Currency = mongoose.model('Currency', currencySchema);
export default Currency;