import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    avatar: String,
    googleId: String,
    refreshToken: String,
    favoriteCountries: [{
        type: String,
        index: true
    }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);