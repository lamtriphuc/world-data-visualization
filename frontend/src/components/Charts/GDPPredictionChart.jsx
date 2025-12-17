import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	ReferenceLine,
} from 'recharts';
import { HiSparkles } from 'react-icons/hi2';
import { getGDPPrediction } from '../../services/gdpPrediction.service';

const GDPPredictionChart = ({ countryCode }) => {
	const { t, i18n } = useTranslation();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showPrediction, setShowPrediction] = useState(false);

	// Get current language
	const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

	const fetchPrediction = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getGDPPrediction(countryCode, currentLang);

			// Combine historical and prediction data
			const chartData = [
				...result.historicalData.map((d) => ({
					year: d.year,
					gdp: d.value,
					type: 'historical',
				})),
				...result.predictions.map((d) => ({
					year: d.year,
					prediction: d.value,
					type: 'prediction',
				})),
			];

			setData({
				chartData,
				analysis: result.analysis,
				lastHistoricalYear:
					result.historicalData[result.historicalData.length - 1]?.year,
			});
			setShowPrediction(true);
		} catch (err) {
			console.error('GDP prediction error:', err);
			setError(err.response?.data?.message || 'Failed to load prediction');
		} finally {
			setLoading(false);
		}
	};

	const formatGDP = (value) => {
		if (!value) return '';
		if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
		if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
		if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
		return `$${value.toLocaleString()}`;
	};

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const item = payload[0];
			const isPrediction = item.dataKey === 'prediction';
			return (
				<div className='bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700'>
					<p className='font-medium text-gray-900 dark:text-white'>
						{label}
						{isPrediction && (
							<span className='ml-2 text-xs text-indigo-500'>
								({t('prediction') || 'Prediction'})
							</span>
						)}
					</p>
					<p className={isPrediction ? 'text-indigo-500' : 'text-emerald-500'}>
						GDP: {formatGDP(item.value)}
					</p>
				</div>
			);
		}
		return null;
	};

	if (!showPrediction) {
		return (
			<div className='mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<HiSparkles className='w-5 h-5 text-indigo-500' />
						<span className='font-medium'>
							{t('gdp_prediction') || 'AI GDP Prediction'}
						</span>
					</div>
					<button
						onClick={fetchPrediction}
						disabled={loading}
						className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2'>
						{loading ? (
							<span className='animate-pulse'>...</span>
						) : (
							<>
								<HiSparkles className='w-4 h-4' />
								{t('predict_5_years') || 'Predict next 5 years'}
							</>
						)}
					</button>
				</div>
				{error && <p className='mt-2 text-red-500 text-sm'>{error}</p>}
			</div>
		);
	}

	return (
		<div className='mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4'>
			<div className='flex items-center gap-2 mb-4'>
				<HiSparkles className='w-5 h-5 text-indigo-500' />
				<span className='font-medium'>
					{t('gdp_prediction') || 'AI GDP Prediction'}
				</span>
			</div>

			{/* Chart */}
			<div className='h-64 w-full'>
				<ResponsiveContainer width='100%' height='100%'>
					<LineChart data={data.chartData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#374151' />
						<XAxis dataKey='year' stroke='#9CA3AF' tick={{ fill: '#9CA3AF' }} />
						<YAxis
							stroke='#9CA3AF'
							tick={{ fill: '#9CA3AF' }}
							tickFormatter={formatGDP}
							width={80}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<ReferenceLine
							x={data.lastHistoricalYear}
							stroke='#6366F1'
							strokeDasharray='3 3'
							label={{
								value: t('prediction_start') || 'Prediction',
								fill: '#6366F1',
								fontSize: 12,
							}}
						/>
						<Line
							type='monotone'
							dataKey='gdp'
							name={t('historical_gdp') || 'Historical GDP'}
							stroke='#10B981'
							strokeWidth={2}
							dot={{ fill: '#10B981', r: 3 }}
							connectNulls
						/>
						<Line
							type='monotone'
							dataKey='prediction'
							name={t('predicted_gdp') || 'Predicted GDP'}
							stroke='#6366F1'
							strokeWidth={2}
							strokeDasharray='5 5'
							dot={{ fill: '#6366F1', r: 3 }}
							connectNulls
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* AI Analysis */}
			{data.analysis && (
				<div className='mt-4 p-3 bg-indigo-200 dark:bg-indigo-900/30 rounded-lg'>
					<p className='text-sm text-indigo-700 dark:text-indigo-300'>
						<span className='font-medium'>AI Analysis:</span> {data.analysis}
					</p>
				</div>
			)}

			{/* Reset button */}
			<button
				onClick={() => setShowPrediction(false)}
				className='mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'>
				{t('hide_prediction') || 'Hide prediction'}
			</button>
		</div>
	);
};

export default GDPPredictionChart;
