import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // cca3
    name: { type: String, required: true },
    countries: [String], // danh sách mã 3 chữ (cca3)
    countryCount: Number
}, { timestamps: true });

const Language = mongoose.model('Language', languageSchema);
export default Language;