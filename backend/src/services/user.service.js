import User from "../models/User.js";
import { getCountriesByListService } from "./country.service.js";

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
