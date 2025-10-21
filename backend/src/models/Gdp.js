// models/Gdp.js
import mongoose from 'mongoose';

const gdpYear = new mongoose.Schema(
    {
        year: Number,
        value: Number,
    },
    { _id: false }
)

const gdpSchema = new mongoose.Schema({
    cca3: { type: String, required: true, unique: true }, // VNM, USA, JPN
    cca2: { type: String }, // VN, US, JP
    data: [gdpYear],
    retrievedAt: { type: Date, default: Date.now }
});

const Gdp = mongoose.model('Gdp', gdpSchema);
export default Gdp;