import express from 'express';
import { getMaxAreaAndPopulation, getStats } from '../controllers/region.controller.js';

const router = express.Router();

router.get('/max', getMaxAreaAndPopulation);
router.get('/stats', getStats);

export default router;