import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});

// Thêm access token vào header
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto refresh token khi access token hết hạn
apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        // Access token hết hạn → retry
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await apiClient.post("/api/auth/refresh-token");

                const newAccessToken = res.data.data.accessToken;
                localStorage.setItem("token", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (e) {
                console.log("Refresh token expired");
                localStorage.removeItem("token");
                return Promise.reject(e);
            }
        }

        return Promise.reject(err);
    }
);

export default apiClient;