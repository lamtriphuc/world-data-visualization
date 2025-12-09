import { useEffect, useState } from 'react';
import { FaX } from 'react-icons/fa6';
import CompareTable from '../components/Tables/CompareTable';
import CompareChart from '../components/Charts/CompareChart';
import { useTranslation } from 'react-i18next';
import {
	getAllCountries,
	getCountryDetails,
} from '../services/country.service';
import { aiCompareCountries } from '../services/ai.service';
import translated from '../scripts/countries_translated.json';

const Comparison = () => {
	const { t } = useTranslation();
	const [countries, setCountries] = useState([]);
	const [selectedCountries, setSelectedCountries] = useState([]);
	const [compareCountries, setCompareCountries] = useState([]);
	const [isTableOpen, setIsTableOpen] = useState(false);
	const maxCountries = 3;
	const currentLang = localStorage.getItem('lang');

	const [isAiLoading, setIsAiLoading] = useState(false);
	const [aiAnalysis, setAiAnalysis] = useState('');

	const handleAiCompare = async () => {
		if (selectedCountries.length < 2) return;

		try {
			setIsAiLoading(true);
			setAiAnalysis('');
			const codes = selectedCountries.filter(Boolean);
			const result = await aiCompareCountries(codes, currentLang || 'en');

			if (result.success) {
				setAiAnalysis(result.analysis);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsAiLoading(false);
		}
	};

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const data = await getAllCountries({ page: 1, limit: 0 });
				setCountries(data.data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchCountries();
	}, []);

	useEffect(() => {
		const fetchCountryDetails = async () => {
			try {
				if (selectedCountries.length > 0) {
					const detailsPromises = selectedCountries.map((code) =>
						code ? getCountryDetails(code) : null
					);
					const details = await Promise.all(detailsPromises);
					const filteredDetails = details.filter((detail) => detail !== null);
					setCompareCountries(filteredDetails);
				} else {
					setCompareCountries([]);
				}
			} catch (error) {
				console.error(error);
			}
		};
		fetchCountryDetails();
	}, [selectedCountries]);

	const handleAddCountry = (index, countryCode) => {
		const updated = [...selectedCountries];
		updated[index] = countryCode;
		setSelectedCountries(updated.slice(0, maxCountries));
	};

	const handleDelete = () => {
		setSelectedCountries([]);
		setIsTableOpen(false);
	};

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	return (
		<>
			<div className='p-6 '>
				<div className='space-y-4  bg-white dark:bg-gray-800 p-4  rounded-sm'>
					<div className='flex items-center justify-between'>
						<h2 className='text-gray-900 dark:text-gray-300'>
							{t('select_country')}
						</h2>
						{selectedCountries.length > 0 && (
							<button
								onClick={handleDelete}
								className='flex items-center px-2 py-1 text-sm border border-gray-900 rounded-md dark:border-gray-200 dark:hover:bg-gray-50/10 dark:hover:border-gray-50/10 dark:text-gray-200 text-gray-900 hover:bg-gray-100 hover:border-gray-500 transition cursor-pointer'>
								<FaX className='w-4 h-4 mr-2' />
								Xóa tất cả
							</button>
						)}
					</div>

					{/* Thẻ selêct */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 '>
						{Array.from({ length: maxCountries }).map((_, index) => (
							<div key={index} className='flex flex-col'>
								<label className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
									{t('country')} {index + 1}
									{index === 0 && <span className='text-red-500 ml-1'>*</span>}
								</label>

								<select
									id={`country-${index}`}
									value={selectedCountries[index] || ''}
									onChange={(e) => handleAddCountry(index, e.target.value)}
									disabled={index > 0 && !selectedCountries[index - 1]}
									className={`border border-gray-300 dark:bg-gray-800 rounded-md p-2 text-sm focus:outline-none focus:ring-2 ${
										index > 0 && !selectedCountries[index - 1]
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: 'focus:ring-blue-500'
									}`}>
									<option value=''>-- {t('select_country')} --</option>
									{countries.map((c) => (
										<option key={c?.cca3} value={c?.cca3}>
											{currentLang === 'vi'
												? getTranslatedName(c?.name)
												: c?.name}
										</option>
									))}
								</select>
							</div>
						))}
					</div>
					<div className='flex justify-center p-4'>
						<button
							className='p-2 rounded-md bg-blue-400 text-black dark:text-white w-100'
							onClick={() => setIsTableOpen(true)}>
							{t('compare')}
						</button>
					</div>
				</div>
				{/* compare table */}
				{isTableOpen && (
					<>
						<div className='bg-white dark:bg-gray-800 p-4 mt-4 rounded-sm'>
							<p className='text-center text-xl font-bold text-gray-800 dark:text-gray-300'>
								{t('comparison_table')}
							</p>
							<CompareTable countries={compareCountries} />
						</div>

						{/* AI Analysis */}
						<div className='bg-white dark:bg-gray-800 p-6 mt-4 rounded-xl shadow-md'>
							<div className='flex items-center justify-between mb-4'>
								<p className='text-xl font-bold text-gray-800 dark:text-gray-300'>
									{t('ai_analysis')}
								</p>
								<button
									onClick={handleAiCompare}
									disabled={isAiLoading}
									className='flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50'>
									{isAiLoading ? (
										<span className='animate-pulse'>{t('analyzing')}...</span>
									) : (
										<>
											<span className='mr-2'>✨</span>
											{t('analyze_with_ai')}
										</>
									)}
								</button>
							</div>

							{aiAnalysis && (
								<div className='prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg'>
									<p className='whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed'>
										{aiAnalysis}
									</p>
								</div>
							)}
						</div>

						{/* Compare Chart */}
						<div className='bg-white dark:bg-gray-800 p-6 mt-4 rounded-xl shadow-md items-start'>
							<p className='text-center text-xl font-bold text-gray-800 dark:text-gray-300 mb-4'>
								{t('comparison_chart')}
							</p>
							<div className='flex items-center overflow-x-auto'>
								<CompareChart countries={compareCountries} />
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
};
export default Comparison;
