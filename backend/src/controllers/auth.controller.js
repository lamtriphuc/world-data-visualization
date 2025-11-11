import User from "../models/User.js";
import { addFavoriteCountryService, getFavoriteCodeService, getFavoriteCountriesService, googleLoginService, removeFavoriteCountryService } from "../services/auth.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const result = await googleLoginService(token);
        return successResponse(res, result, 200, 'Login success');
    } catch (error) {
        console.error(error);
        return errorResponse(res, error.message, 500);
    }
};

export const addFavoriteCountry = async (req, res) => {
    try {
        const userId = req.user.id; // lấy từ middleware xác thực JWT
        const { countryCode } = req.params;

        const favorites = await addFavoriteCountryService(userId, countryCode);
        return successResponse(res, favorites, 200, 'Country added to favorites');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const removeFavoriteCountry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { countryCode } = req.params;

        const favorites = await removeFavoriteCountryService(userId, countryCode);
        return successResponse(res, favorites, 200, 'Country removed from favorites');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const getFavoriteCodes = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await getFavoriteCodeService(userId);
        return successResponse(res, favorites, 200, 'Fetched favorite countries');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const getFavoriteCountries = async (req, res) => {
    try {
        const userId = req.user.id;

        const favorites = await getFavoriteCountriesService(userId);
        return successResponse(res, favorites, 200, 'Fetched favorite countries');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};