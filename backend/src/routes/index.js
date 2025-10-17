import express from 'express';
import countryRoutes from './country.route.js';

const router = express.Router();

router.use('/countries', countryRoutes);

export default router;