import axios from "axios";
import apiClient from './apiClient'

export const googleLogin = async (token) => {
    const response = await apiClient.post('/api/auth/google-login', { token });
    return response.data.data;
};

export const getFavoriteCodes = async () => {
    const response = await apiClient.get(`/api/user/favorites-code`)
    return response.data.data;
};

export const getFavoriteCountries = async () => {
    const response = await apiClient.get(`/api/user/favorites`)
    return response.data.data;
};

export const addFavorite = async (code) => {
    const response = await apiClient.post(`/api/user/favorites/${code}`)
    return response.data.data;
};

export const removeFavorite = async (code) => {
    const response = await apiClient.delete(`/api/user/favorites/${code}`)
    return response.data.data;
};

export const getTravelTracker = async () => {
    const response = await apiClient.get(`/api/user/travel`)
    return response.data.data;
};

export const postTravelTracker = async (data) => {
    const response = await apiClient.post(`/api/user/travel`, data)
    return response.data.data;
};

export const deleteTravelTracker = async (cca3) => {
    const response = await apiClient.delete(`/api/user/travel/${cca3}`)
    return response.data.data;
};