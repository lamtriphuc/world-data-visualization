// ml.service.js - Service để gọi ML API từ Express
import axios from 'axios';

const ML_API_BASE_URL = process.env.ML_API_URL || 'http://localhost:5000';

// Create axios instance với retry logic
const mlClient = axios.create({
	baseURL: ML_API_BASE_URL,
	timeout: 30000,
});

// ===========================
// API FUNCTIONS
// ===========================

export const mlService = {
	/**
	 * Lấy clustering của các quốc gia
	 */
	async getClusters() {
		try {
			const response = await mlClient.get('/api/ml/clusters');
			return response.data;
		} catch (error) {
			console.error('❌ Error getting clusters:', error.message);
			throw error;
		}
	},

	/**
	 * Dự đoán GDP của một quốc gia
	 * @param {string} countryCode - Country code (e.g., 'USA', 'GBR')
	 */
	async predictGDP(countryCode) {
		try {
			const response = await mlClient.get(`/api/ml/predict-gdp/${countryCode}`);
			return response.data;
		} catch (error) {
			console.error(
				`❌ Error predicting GDP for ${countryCode}:`,
				error.message
			);
			throw error;
		}
	},

	/**
	 * Tìm quốc gia tương đồng
	 * @param {string} countryCode - Country code
	 * @param {number} topN - Number of similar countries to return
	 */
	async getSimilarCountries(countryCode, topN = 5) {
		try {
			const response = await mlClient.get(`/api/ml/similar/${countryCode}`, {
				params: { top_n: topN },
			});
			return response.data;
		} catch (error) {
			console.error(
				`❌ Error getting similar countries for ${countryCode}:`,
				error.message
			);
			throw error;
		}
	},

	/**
	 * Phân tích mạng lưới địa chính trị
	 */
	async getNetworkAnalysis() {
		try {
			const response = await mlClient.get('/api/ml/network-analysis');
			return response.data;
		} catch (error) {
			console.error('❌ Error getting network analysis:', error.message);
			throw error;
		}
	},

	/**
	 * Lấy thông tin về các models
	 */
	async getModelInfo() {
		try {
			const response = await mlClient.get('/api/ml/model-info');
			return response.data;
		} catch (error) {
			console.error('❌ Error getting model info:', error.message);
			throw error;
		}
	},

	/**
	 * Trigger retraining models
	 * @param {boolean} async - Chạy background hay không
	 */
	async triggerRetrain(runAsync = true) {
		try {
			const response = await mlClient.post('/api/ml/retrain', {
				async: runAsync,
			});
			return response.data;
		} catch (error) {
			console.error('❌ Error triggering retrain:', error.message);
			throw error;
		}
	},

	/**
	 * Health check của ML API
	 */
	async healthCheck() {
		try {
			const response = await mlClient.get('/health');
			return response.data;
		} catch (error) {
			console.error('❌ ML API health check failed:', error.message);
			return {
				status: 'error',
				models_loaded: false,
				error: error.message,
			};
		}
	},
};

export default mlService;
