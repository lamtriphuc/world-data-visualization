import mongoose from "mongoose";

const regionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    totalPopulation: { type: Number, default: 0 },
    totalArea: { type: Number, default: 0 },
    populationDensity: { type: Number, default: 0 },
    independentCountryCount: { type: Number, default: 0 },
    dependentTerritoryCount: { type: Number, default: 0 },
    lastAggregatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Region = mongoose.model('Region', regionSchema);
export default Region;