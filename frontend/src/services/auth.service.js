import axios from "axios";

export const googleLogin = async (token) => {
    const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google-login`, { token }
    );
    return response.data.data;
};