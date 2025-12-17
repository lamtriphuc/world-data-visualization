import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	HiSparkles,
	HiMapPin,
	HiHeart,
	HiCurrencyDollar,
	HiStar,
} from 'react-icons/hi2';
import { aiTravelAdvisor } from '../../services/ai.service';

const AITravelAdvisor = ({ onCountryClick }) => {
	const { t, i18n } = useTranslation();
	const [preferences, setPreferences] = useState('');
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

	const exampleQueries =
		currentLang === 'vi'
			? [
				'Biển đẹp, chi phí rẻ, visa dễ',
				'Du lịch châu Âu mùa đông, nhiều tuyết',
				'Thiên nhiên hoang sơ, ít khách du lịch',
				'Ẩm thực ngon, văn hóa phong phú',
			]
			: [
				'Beach vacation, low budget, easy visa',
				'Winter in Europe with snow',
				'Wild nature, off the beaten path',
				'Great food and rich culture',
			];

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!preferences.trim()) return;

		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const data = await aiTravelAdvisor(preferences, currentLang);
			setResult(data);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to get recommendations');
		} finally {
			setLoading(false);
		}
	};

	const handleExampleClick = (query) => {
		setPreferences(query);
	};

	const handleCountryCardClick = (rec) => {
		if (onCountryClick) {
			onCountryClick(rec.countryCode);
		}
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden'>
			{/* Header */}
			<div className='bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4'>
				<div className='flex items-center gap-3'>
					<div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
						<HiMapPin className='w-6 h-6 text-white' />
					</div>
					<div>
						<h2 className='text-xl font-bold text-white'>
							{t('travel_advisor') || 'AI Travel Advisor'}
						</h2>
						<p className='text-white/80 text-sm'>
							{t('travel_advisor_desc') ||
								"Tell us your preferences, we'll find your dream destination"}
						</p>
					</div>
				</div>
			</div>

			<div className='p-6'>
				{/* Input Form */}
				<form onSubmit={handleSubmit}>
					<textarea
						value={preferences}
						onChange={(e) => setPreferences(e.target.value)}
						placeholder={
							t('travel_placeholder') ||
							'Describe your ideal travel destination... (e.g., "Beach vacation, budget-friendly, good food, easy visa")'
						}
						className='w-full h-24 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500'
						disabled={loading}
					/>

					{/* Example Chips */}
					<div className='mt-3 flex flex-wrap gap-2'>
						{exampleQueries.map((query, idx) => (
							<button
								key={idx}
								type='button'
								onClick={() => handleExampleClick(query)}
								className='px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors'>
								{query}
							</button>
						))}
					</div>

					<button
						type='submit'
						disabled={!preferences.trim() || loading}
						className='mt-4 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 rounded-xl text-white font-medium flex items-center justify-center gap-2'>
						{loading ? (
							<span className='animate-pulse'>...</span>
						) : (
							<>
								<HiSparkles className='w-5 h-5' />
								{t('get_recommendations') || 'Get Recommendations'}
							</>
						)}
					</button>
				</form>

				{/* Error */}
				{error && (
					<div className='mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300'>
						{error}
					</div>
				)}

				{/* Results */}
				{result && (
					<div className='mt-6 space-y-4'>
						{/* Explanation */}
						<p className='text-gray-600 dark:text-gray-300 italic'>
							{result.explanation}
						</p>

						{/* Recommendations */}
						<div className='space-y-4'>
							{result.recommendations?.map((rec, idx) => (
								<div
									key={idx}
									onClick={() => handleCountryCardClick(rec)}
									className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer'>
									<div className='flex items-start justify-between'>
										<div className='flex items-center gap-3'>
											{rec.flag && (
												<img
													src={rec.flag}
													alt={rec.countryName}
													className='w-12 h-8 object-cover rounded shadow'
												/>
											)}
											<div>
												<span className='font-bold text-lg hover:text-emerald-500 transition-colors'>
													{rec.countryName}
												</span>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													{rec.region}
												</p>
											</div>
										</div>
										<div className='flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'>
											<HiStar className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
											<span className='text-sm font-medium text-emerald-700 dark:text-emerald-300'>
												{rec.matchScore}%
											</span>
										</div>
									</div>

									{/* Reasons */}
									<div className='mt-3 flex flex-wrap gap-2'>
										{rec.reasons?.map((reason, i) => (
											<span
												key={i}
												className='inline-flex items-center gap-1 px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full text-xs text-emerald-700 dark:text-emerald-300'>
												<HiHeart className='w-3 h-3' />
												{reason}
											</span>
										))}
									</div>

									{/* Tips */}
									{rec.tips && (
										<p className='mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2'>
											<HiCurrencyDollar className='w-4 h-4 mt-0.5 text-emerald-500' />
											{rec.tips}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AITravelAdvisor;
