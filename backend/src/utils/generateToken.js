import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" } // nên 5–15 phút
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" } // 7–30 ngày
    );
};