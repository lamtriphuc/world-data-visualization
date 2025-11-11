import axios from "axios";
import apiClient from './apiClient'

export const googleLogin = async (token) => {
    const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google-login`, { token }
    );
    return response.data.data;
};

export const getFavoriteCodes = async () => {
    const response = await apiClient.get(`/api/auth/favorites-code`)
    return response.data.data;
};

export const getFavoriteCountries = async () => {
    const response = await apiClient.get(`/api/auth/favorites`)
    return response.data.data;
};

export const addFavorite = async (code) => {
    const response = await apiClient.post(`/api/auth/favorites/${code}`)
    return response.data.data;
};

export const removeFavorite = async (code) => {
    const response = await apiClient.delete(`/api/auth/favorites/${code}`)
    return response.data.data;
};