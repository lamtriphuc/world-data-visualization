import { OAuth2Client } from "google-auth-library";
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateToken } from "../utils/generateToken.js";
import { getCountriesByListService } from './country.service.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginService = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    // tìm or tạo user
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            googleId: sub,
            name,
            email,
            avatar: picture,
        })
    }

    const accessToken = generateToken(user._id);

    return { user, accessToken };
}

export const addFavoriteCountryService = async (userId, countryCode) => {
    const user = await User.findById(userId);
    if (!user)
        throw new Error('User not found');

    countryCode = countryCode.toUpperCase();

    // Tránh trùng
    if (!user.favoriteCountries.includes(countryCode)) {
        user.favoriteCountries.push(countryCode);
        await user.save();
    }

    return user.favoriteCountries;
}

export const removeFavoriteCountryService = async (userId, countryCode) => {
    const user = await User.findById(userId);
    if (!user)
        throw new Error('User not found');

    countryCode = countryCode.toUpperCase();

    user.favoriteCountries = user.favoriteCountries.filter(c => c !== countryCode);
    await user.save();

    return user.favoriteCountries;
}

export const getFavoriteCodeService = async (userId) => {
    const user = await User.findById(userId);
    if (!user)
        throw new Error('User not found');

    return user.favoriteCountries;
}

export const getFavoriteCountriesService = async (userId) => {
    const user = await User.findById(userId);
    if (!user)
        throw new Error('User not found');

    const favoriteCodes = user.favoriteCountries; // list

    const favoriteCountries = getCountriesByListService(favoriteCodes);

    return favoriteCountries;
}