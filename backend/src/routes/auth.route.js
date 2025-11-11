import express from 'express';
import { addFavoriteCountry, getFavoriteCodes, getFavoriteCountries, googleLogin, removeFavoriteCountry } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/google-login', googleLogin);
router.get('/favorites', verifyToken, getFavoriteCountries);
router.get('/favorites-code', verifyToken, getFavoriteCodes);
router.post('/favorites/:countryCode', verifyToken, addFavoriteCountry);
router.delete('/favorites/:countryCode', verifyToken, removeFavoriteCountry);

export default router;