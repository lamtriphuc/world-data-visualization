import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { addFavoriteCountry, getFavoriteCodes, getFavoriteCountries, removeFavoriteCountry } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/favorites', verifyToken, getFavoriteCountries);
router.get('/favorites-code', verifyToken, getFavoriteCodes);
router.post('/favorites/:countryCode', verifyToken, addFavoriteCountry);
router.delete('/favorites/:countryCode', verifyToken, removeFavoriteCountry);

export default router;