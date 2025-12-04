import mongoose from 'mongoose'
const userCountryStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // Country code (CCA3)
    countryCode: {
        type: String,
        required: true,
        index: true
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

// mỗi user chỉ có 1 trạng thái / quốc gia
userCountryStatusSchema.index({ userId: 1, countryCode: 1 }, { unique: true });

export default mongoose.model('UserCountryStatus', userCountryStatusSchema);