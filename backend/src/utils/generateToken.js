import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.GOOGLE_CLIENT_SECRET, {
        expiresIn: '7d'
    })
}
