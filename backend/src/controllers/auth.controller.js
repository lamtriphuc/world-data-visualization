import { googleLoginService } from "../services/auth.service.js";
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