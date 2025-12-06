import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { addFavoriteCountry, getFavoriteCodes, getFavoriteCountries, removeFavoriteCountry } from '../controllers/user.controller.js';
import travelRoutes from './travelStatus.routes.js';

const router = express.Router();

router.get('/favorites', verifyToken, getFavoriteCountries);
router.get('/favorites-code', verifyToken, getFavoriteCodes);
router.post('/favorites/:countryCode', verifyToken, addFavoriteCountry);
router.delete('/favorites/:countryCode', verifyToken, removeFavoriteCountry);

router.use('/travel', verifyToken, travelRoutes);

export default router;