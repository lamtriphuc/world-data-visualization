import { OAuth2Client } from "google-auth-library";
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { getCountriesByListService } from './country.service.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginService = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload();
    const {
        sub: googleId,
        name,
        email,
        picture,
        email_verified
    } = payload;

    if (!email_verified) {
        throw new Error("Email is not verified by Google");
    }

    // 2. Upsert user (avoid race condition)
    const user = await User.findOneAndUpdate(
        { email },
        {
            $set: {
                googleId,
                name: name || "",
                avatar: picture || ""
            }
        },
        { new: true, upsert: true }
    );

    // 3. Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();


    return {
        user,
        accessToken,
        refreshToken
    };
}

export const refreshTokenService = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token)
        throw new Error('Invalid refresh token');

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
