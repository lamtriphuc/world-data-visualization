import User from "../models/User.js";
import { googleLoginService, refreshTokenService } from "../services/auth.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const result = await googleLoginService(token);
        // Set cookie refresh token
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,       // bật khi deploy HTTPS
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 ngày
        });
        return successResponse(res, { user: result.user, accessToken: result.accessToken }, 200, 'Login success');
    } catch (error) {
        console.error(error);
        return errorResponse(res, error.message, 500);
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return errorResponse(res, "No refresh token", 401);

        const result = await refreshTokenService(token);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,       // bật khi deploy HTTPS
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 ngày
        });
        return successResponse(res, { accessToken: result.accessToken }, 200, 'Get refresh token success');
    } catch (error) {
        console.error(error);
        return errorResponse(res, error.message, 500);
    }
};