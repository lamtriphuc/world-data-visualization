import jwt from 'jsonwebtoken';
import { errorResponse } from "../utils/response.js";

export const verifyToken = (req, res, next) => {
    try {
        // Lấy token từ header (ví dụ: Authorization: Bearer <token>)
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(res, 'Access token is required', 401);
        }

        // Giải mã token
        jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
            if (err) {
                if (err) console.log(err);

                if (err.name === "TokenExpiredError") {
                    return errorResponse(res, "Token expired", 401);
                }

                return errorResponse(res, "Invalid token", 403);
            }

            // Gắn thông tin user vào request để controller dùng
            req.user = decoded; // decoded chứa { id, iat, exp }
            next();
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};
