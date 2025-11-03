import { OAuth2Client } from "google-auth-library";
import User from '../models/User.js';
import { generateToken } from "../utils/generateToken.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLoginService = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    // tìm or tạo user
    let user = await User.findOne({ email });
    if (!user) {
        user = User.create({
            googleId: sub,
            name,
            email,
            avatar: picture,
        })
    }

    const jwtToken = generateToken(user._id);

    return { user, token: jwtToken }
}