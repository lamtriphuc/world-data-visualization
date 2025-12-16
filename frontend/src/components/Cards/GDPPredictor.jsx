// GDPPredictor.jsx - Component dự đoán GDP (với Tailwind CSS)
import { useState } from 'react';
import { FiTrendingUp, FiTarget, FiPercent } from 'react-icons/fi';

const GDPPredictor = ({ countryCode = 'USA' }) => {
	const [selectedCountry, setSelectedCountry] = useState(countryCode);
	const [prediction, setPrediction] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE = 'http://localhost:3001/api/ml';

	const predictGDP = async (code) => {
		if (!code.trim()) {
			setError('Please enter a country code');
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const response = await fetch(
				`${API_BASE}/predict-gdp/${code.toUpperCase()}`
			);
			const data = await response.json();

			if (data.success) {
				setPrediction(data.data);
				setSelectedCountry(code.toUpperCase());
			} else {
				setError(data.error || 'Failed to get prediction');
				setPrediction(null);
			}
		} catch (err) {
			setError(err.message);
			setPrediction(null);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			predictGDP(e.target.value);
		}
	};

	const formatGDP = (value) => {
		if (value >= 1e12) {
			return `$${(value / 1e12).toFixed(2)}T`;
		} else if (value >= 1e9) {
			return `$${(value / 1e9).toFixed(2)}B`;
		}
		return `$${value.toLocaleString()}`;
	};

	const getConfidenceBadgeColor = (confidence) => {
		switch (confidence) {
			case 'high':
				return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
			case 'medium':
				return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
			case 'low':
				return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
			default:
				return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
		}
	};

	return (
		<div className='w-full'>
			<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg'>
				{/* Header */}
				<div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-6'>
					<h2 className='flex items-center gap-2 text-2xl font-bold text-white mb-2'>
						<FiTrendingUp size={28} />
						GDP Prediction
					</h2>
					<p className='text-indigo-100'>
						AI-powered GDP forecasting based on country metrics
					</p>
				</div>

				{/* Content */}
				<div className='p-6 space-y-6'>
					{/* Input Section */}
					<div className='flex gap-3'>
						<input
							type='text'
							placeholder='Enter country code (e.g., USA, CHN, IND)'
							value={selectedCountry}
							onKeyPress={handleKeyPress}
							onChange={(e) => setSelectedCountry(e.target.value)}
							disabled={loading}
							className='flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition'
						/>
						<button
							onClick={() => predictGDP(selectedCountry)}
							disabled={loading}
							className='px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:opacity-50 transition'>
							{loading ? 'Predicting...' : 'Predict'}
						</button>
					</div>

					{/* Error Message */}
					{error && (
						<div className='p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400'>
							<span>⚠️ {error}</span>
						</div>
					)}

					{/* Prediction Results */}
					{prediction && (
						<div className='space-y-4'>
							<div className='flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700'>
								<h3 className='text-2xl font-bold text-gray-900 dark:text-white'>
									{prediction.country}
								</h3>
								<span className='px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full font-semibold text-sm'>
									{prediction.country_code}
								</span>
							</div>

							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								{/* Actual GDP */}
								<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700'>
									<div className='flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold mb-2'>
										<FiTarget size={18} />
										Actual GDP
									</div>
									<div className='text-2xl font-bold text-blue-900 dark:text-blue-300'>
										{formatGDP(prediction.actual_gdp)}
									</div>
								</div>

								{/* Predicted GDP */}
								<div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700'>
									<div className='flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold mb-2'>
										<FiTrendingUp size={18} />
										Predicted GDP
									</div>
									<div className='text-2xl font-bold text-purple-900 dark:text-purple-300'>
										{formatGDP(prediction.predicted_gdp)}
									</div>
								</div>

								{/* Error Rate */}
								<div className='p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700'>
									<div className='flex items-center gap-2 text-orange-700 dark:text-orange-400 font-semibold mb-2'>
										<FiPercent size={18} />
										Error Rate
									</div>
									<div className='text-2xl font-bold text-orange-900 dark:text-orange-300'>
										{prediction.error_percent.toFixed(2)}%
									</div>
								</div>

								{/* Confidence */}
								<div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
									<div className='text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2'>
										Confidence
									</div>
									<div
										className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getConfidenceBadgeColor(
											prediction.confidence
										)}`}>
										{prediction.confidence.toUpperCase()}
									</div>
								</div>
							</div>

							<div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400'>
								<small>
									Model:{' '}
									<span className='font-semibold'>{prediction.model_type}</span>{' '}
									| Accuracy based on historical data
								</small>
							</div>
						</div>
					)}

					{/* Placeholder */}
					{!prediction && !error && !loading && (
						<div className='text-center py-12'>
							<div className='text-5xl mb-4'>📊</div>
							<p className='text-gray-700 dark:text-gray-300 font-medium mb-2'>
								Enter a country code to see GDP prediction
							</p>
							<p className='text-gray-500 dark:text-gray-400 text-sm'>
								Example: USA, CHN, JPN, IND, GBR
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GDPPredictor;
