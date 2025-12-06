import express from 'express';
import { smartSearch } from '../controllers/smartSearch.controller.js';

const router = express.Router();

// POST /api/search/smart - AI-powered natural language search
router.post('/smart', smartSearch);

export default router;
