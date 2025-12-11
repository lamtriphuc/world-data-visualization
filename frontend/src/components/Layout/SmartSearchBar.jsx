import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiSparkles } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { smartSearch } from '../../services/smartSearch.service';

const SAMPLE_QUERIES = [
	{
		en: 'Countries in Asia with population over 100 million',
		vi: 'Các quốc gia châu Á có dân số trên 100 triệu',
	},
	{ en: 'G7 countries', vi: 'Các quốc gia G7' },
	{ en: 'Socialist countries', vi: 'Các quốc gia xã hội chủ nghĩa' },
	{ en: 'ASEAN members', vi: 'Các thành viên ASEAN' },
	{ en: 'Richest countries in Europe', vi: 'Các quốc gia giàu nhất châu Âu' },
	{ en: 'Countries with monarchy', vi: 'Các quốc gia theo chế độ quân chủ' },
];

const SmartSearchBar = ({ onSearchResults, onClear }) => {
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [error, setError] = useState(null);
	const [interpretation, setInterpretation] = useState('');

	const { t, i18n } = useTranslation();
	const inputRef = useRef(null);
	const containerRef = useRef(null);
	const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

	// Close suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSearch = async (searchQuery) => {
		const q = searchQuery || query;
		if (!q.trim()) return;

		setIsLoading(true);
		setError(null);
		setShowSuggestions(false);

		try {
			const result = await smartSearch(q.trim());
			setInterpretation(result.interpretation);
			onSearchResults(result.countries, result.interpretation, result.total);
		} catch (err) {
			console.error('Smart search error:', err);
			setError(t('search_error') || 'Search failed. Please try again.');
			onSearchResults([], '', 0);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const handleSuggestionClick = (suggestion) => {
		const queryText = currentLang === 'vi' ? suggestion.vi : suggestion.en;
		setQuery(queryText);
		handleSearch(queryText);
	};

	const handleClear = () => {
		setQuery('');
		setInterpretation('');
		setError(null);
		onClear();
	};

	return (
		<div className='relative w-full' ref={containerRef}>
			{/* Search Input */}
			<div className='relative'>
				<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
					<HiSparkles
						className={`w-5 h-5 ${
							isLoading ? 'text-indigo-500 animate-pulse' : 'text-indigo-400'
						}`}
					/>
				</div>
				<input
					ref={inputRef}
					type='text'
					className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 pl-10 pr-20 shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all'
					placeholder={
						t('smart_search_placeholder') || 'Ask anything about countries...'
					}
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setShowSuggestions(true);
					}}
					onFocus={() => setShowSuggestions(true)}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
				/>
				<div className='absolute inset-y-0 right-0 flex items-center pr-2 gap-1'>
					{query && (
						<button
							onClick={handleClear}
							className='p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
							title={t('clear') || 'Clear'}>
							<IoClose className='w-4 h-4' />
						</button>
					)}
					<button
						onClick={() => handleSearch()}
						disabled={isLoading || !query.trim()}
						className='px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
						{isLoading ? '...' : <FaMagnifyingGlass />}
					</button>
				</div>
			</div>

			{/* Interpretation Display */}
			{interpretation && !showSuggestions && (
				<div className='mt-2 px-3 py-2 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2'>
					<HiSparkles className='w-4 h-4 flex-shrink-0' />
					<span>{interpretation}</span>
				</div>
			)}

			{/* Error Display */}
			{error && (
				<div className='mt-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/30 text-sm text-red-600 dark:text-red-400'>
					{error}
				</div>
			)}

			{/* Suggestions Dropdown */}
			{showSuggestions && !isLoading && (
				<div className='absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
					<div className='px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50'>
						{t('sample_queries') || 'Try these queries'}
					</div>
					<ul className='max-h-60 overflow-auto'>
						{SAMPLE_QUERIES.map((suggestion, index) => (
							<li
								key={index}
								className='px-3 py-2.5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2 transition-colors'
								onClick={() => handleSuggestionClick(suggestion)}>
								<HiSparkles className='w-4 h-4 text-indigo-400 flex-shrink-0' />
								<span>
									{currentLang === 'vi' ? suggestion.vi : suggestion.en}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SmartSearchBar;
