// ml.route.js - Routes cho ML features
import express from 'express';
import mlService from '../services/ml.service.js';

const router = express.Router();

// ===========================
// MIDDLEWARE
// ===========================

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

// ===========================
// ROUTES
// ===========================

/**
 * GET /api/ml/clusters
 * Lấy clustering của các quốc gia
 */
router.get(
	'/clusters',
	asyncHandler(async (req, res) => {
		const data = await mlService.getClusters();
		res.json(data);
	})
);

/**
 * GET /api/ml/predict-gdp/:countryCode
 * Dự đoán GDP của một quốc gia
 */
router.get(
	'/predict-gdp/:countryCode',
	asyncHandler(async (req, res) => {
		const { countryCode } = req.params;
		const data = await mlService.predictGDP(countryCode);
		res.json(data);
	})
);

/**
 * GET /api/ml/similar/:countryCode
 * Tìm quốc gia tương đồng
 */
router.get(
	'/similar/:countryCode',
	asyncHandler(async (req, res) => {
		const { countryCode } = req.params;
		const { top_n = 5 } = req.query;
		const data = await mlService.getSimilarCountries(
			countryCode,
			parseInt(top_n)
		);
		res.json(data);
	})
);

/**
 * GET /api/ml/network-analysis
 * Phân tích mạng lưới địa chính trị
 */
router.get(
	'/network-analysis',
	asyncHandler(async (req, res) => {
		const data = await mlService.getNetworkAnalysis();
		res.json(data);
	})
);

/**
 * GET /api/ml/model-info
 * Lấy thông tin về các models
 */
router.get(
	'/model-info',
	asyncHandler(async (req, res) => {
		const data = await mlService.getModelInfo();
		res.json(data);
	})
);

/**
 * POST /api/ml/retrain
 * Trigger retraining models
 * Body: { "async": true }
 */
router.post(
	'/retrain',
	asyncHandler(async (req, res) => {
		const { async: runAsync = true } = req.body;
		const data = await mlService.triggerRetrain(runAsync);
		res.json(data);
	})
);

/**
 * GET /api/ml/health
 * Health check
 */
router.get(
	'/health',
	asyncHandler(async (req, res) => {
		const data = await mlService.healthCheck();
		res.json(data);
	})
);

export default router;
