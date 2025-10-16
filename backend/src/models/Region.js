import mongoose from "mongoose";

const regionSchema = new mongoose.Schema({
    // tên khu vực or tiểu khu vực
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ['region', 'subregion'],
        required: true
    },
    totalPopulation: Number,
    totalArea: Number,
    averagePopulationDensity: Number,
    countryCount: Number,
    lastAggregatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Region = mongoose.model('Region', regionSchema);
export default Region;