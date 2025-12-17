import mongoose from 'mongoose'
const userCountryStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    cca3: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['visited', 'bucket', 'living'],
        required: true
    },

    note: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
}, { timestamps: true });

userCountryStatusSchema.index({ userId: 1, cca3: 1 }, { unique: true });

export default mongoose.model('UserCountryStatus', userCountryStatusSchema);