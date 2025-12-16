import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountryCard from '../components/Cards/CountryCard';
import CountrySearch from '../components/Layout/CountrySearch';
import RegionDropdown from '../components/Layout/RegionDropdown';
import SortOptions from '../components/Layout/SortOptions';
import Loading from '../components/Layout/Loading';
import { getAllCountries } from '../services/country.service';
import {
	addFavorite,
	getFavoriteCodes,
	removeFavorite,
} from '../services/auth.service';
import translated from '../scripts/countries_translated.json';
import { HiSparkles } from 'react-icons/hi2';
import { SlMagnifier } from 'react-icons/sl';
import { useDebounce } from '../hooks/useDebounce';

const CountryList = () => {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();

	// States
	const [countries, setCountries] = useState([]);
	const [allCountries, setAllCountries] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [favorites, setFavorites] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [appliedSearch, setAppliedSearch] = useState('');

	const debouncedSuggest = useDebounce(searchTerm, 300);

	// Smart Search from header navigation
	const [smartSearchResults, setSmartSearchResults] = useState(null);
	const [smartSearchInterpretation, setSmartSearchInterpretation] =
		useState('');
	const [smartSearchQuery, setSmartSearchQuery] = useState('');

	// Hooks
	const [searchParams, setSearchParams] = useSearchParams();
	const currentLang = localStorage.getItem('lang');

	// Get page from URL or default to 1
	const page = parseInt(searchParams.get('page')) || 1;

	// Build query params
	const regionParam = searchParams.get('region')
		? `&region=${searchParams.get('region')}`
		: '';
	const subregionParam = searchParams.get('subregion')
		? `&subregion=${searchParams.get('subregion')}`
		: '';
	const sortByParam = searchParams.get('sortBy')
		? `&sortBy=${searchParams.get('sortBy')}`
		: '';
	const sortOrderParam = searchParams.get('sortOrder')
		? `&sortOrder=${searchParams.get('sortOrder')}`
		: '';
	const searchParam = appliedSearch ? `&search=${appliedSearch}` : '';

	// Handle smart search results from header navigation
	useEffect(() => {
		if (location.state?.smartSearchResults) {
			setSmartSearchResults(location.state.smartSearchResults);
			setSmartSearchInterpretation(
				location.state.smartSearchInterpretation || ''
			);
			setSmartSearchQuery(location.state.smartSearchQuery || '');
			setLoading(false);
			// Clear location state to prevent re-applying on refresh
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);

	// Fetch favorites on mount
	useEffect(() => {
		const fetchFavorites = async () => {
			const token = localStorage.getItem('token');
			if (!token) return;

			try {
				const data = await getFavoriteCodes();
				setFavorites(data);
			} catch (error) {
				console.error('Get favorite fail:', error);
			}
		};

		fetchFavorites();
	}, []);

	// Fetch all countries for search
	useEffect(() => {
		const fetchAllCountries = async () => {
			try {
				const response = await getAllCountries({
					page: 1,
					limit: 0,
				});
				setAllCountries(response.data);
			} catch (error) {
				console.error('Fetch all countries error:', error);
			}
		};

		fetchAllCountries();
	}, []);

	// Reset to page 1 when filters change
	useEffect(() => {
		if (page !== 1 && !smartSearchResults) {
			updatePage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [regionParam, subregionParam, sortByParam, sortOrderParam]);

	// Fetch paginated countries based on filters
	useEffect(() => {
		if (smartSearchResults) return; // Skip when showing smart search results

		const fetchCountries = async () => {
			try {
				const response = await getAllCountries({
					page,
					region: regionParam,
					subregion: subregionParam,
					search: searchParam,
					sortBy: sortByParam,
					sortOrder: sortOrderParam,
				});

				setTotalPages(response.totalPages);
				setCountries(response.data);
				window.scrollTo(0, 0);
			} catch (error) {
				console.error('Fetch countries error:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCountries();
	}, [
		page,
		regionParam,
		subregionParam,
		sortByParam,
		sortOrderParam,
		smartSearchResults,
		searchParam,
	]);

	useEffect(() => {
		if (!debouncedSuggest) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		const fetchSuggestions = async () => {
			try {
				const res = await getAllCountries({
					page: 1,
					search: `&search=${debouncedSuggest}`,
				});

				const list = res.data.slice(0, 7);
				setSuggestions(list);

				const exactMatch =
					list.length === 1 &&
					list[0].name.toLowerCase() === debouncedSuggest.toLowerCase();

				setShowSuggestions(!exactMatch);
			} catch (err) {
				console.error('Suggestion error:', err);
			}
		};

		fetchSuggestions();
	}, [debouncedSuggest]);

	useEffect(() => {
		const handleOutside = () => setShowSuggestions(false);
		window.addEventListener('click', handleOutside);
		return () => window.removeEventListener('click', handleOutside);
	}, []);

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setAppliedSearch('');
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [searchTerm]);

	// Helper functions
	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	const updatePage = (newPage) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', newPage.toString());
		setSearchParams(params);
	};

	const handleToggleFavorite = async (countryCode, newState) => {
		try {
			if (newState) {
				await addFavorite(countryCode);
			} else {
				await removeFavorite(countryCode);
			}
		} catch (error) {
			console.error('Favorite error:', error);
		}
	};

	const handleCountrySelect = (country) => {
		navigate(`/country/${country.cca3}`);
	};

	const clearSmartSearch = () => {
		setSmartSearchResults(null);
		setSmartSearchInterpretation('');
		setSmartSearchQuery('');
	};

	// Determine which countries to display
	const displayCountries = smartSearchResults || countries;

	if (loading) return <Loading />;

	return (
		<>
			{/* Smart Search Result Banner */}
			{smartSearchResults && (
				<div className='mb-6 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<HiSparkles className='w-5 h-5 text-indigo-500' />
							<div>
								<p className='text-sm text-indigo-700 dark:text-indigo-300'>
									<span className='font-medium'>"{smartSearchQuery}"</span>
								</p>
								<p className='text-xs text-indigo-600 dark:text-indigo-400'>
									{smartSearchInterpretation} • {t('found') || 'Found'}{' '}
									{smartSearchResults.length} {t('countries') || 'countries'}
								</p>
							</div>
						</div>
						<button
							onClick={clearSmartSearch}
							className='text-sm text-indigo-600 dark:text-indigo-400 hover:underline'>
							{t('show_all') || 'Show all countries'}
						</button>
					</div>
				</div>
			)}

			{/* Search and Filters */}
			<div className='flex flex-col items-start justify-between gap-4 w-full md:flex-row md:items-center pb-8'>
				<div
					className='relative w-full md:max-w-[419px]'
					onClick={(e) => e.stopPropagation()}>
					<div className='flex items-center gap-3 rounded-sm px-5 py-4 bg-white dark:bg-gray-800 shadow'>
						<SlMagnifier className='text-gray-400' />
						<input
							type='text'
							placeholder={t('search_placeholder')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onFocus={() => {
								if (
									suggestions.length !== 1 ||
									searchTerm.trim().toLowerCase() !==
										suggestions[0]?.name.toLowerCase()
								) {
									setShowSuggestions(true);
								}
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									setAppliedSearch(searchTerm);
									setShowSuggestions(false);
								}
							}}
							className='w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 
                                focus:outline-none'
						/>
					</div>

					{showSuggestions && suggestions.length > 0 && (
						<ul className='absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border z-20'>
							{suggestions.map((item) => (
								<li
									key={item.cca3}
									onClick={() => {
										setSearchTerm(item.name);
										setAppliedSearch(item.name);
										setShowSuggestions(false);
									}}
									className='px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'>
									{currentLang === 'vi'
										? getTranslatedName(item.name)
										: item.name}
								</li>
							))}
						</ul>
					)}
				</div>
				<div className='flex gap-4'>
					<SortOptions />
					<RegionDropdown />
				</div>
			</div>

			{/* Country Cards Grid */}
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
				{displayCountries.map((country) => (
					<CountryCard
						key={country.cca3}
						name={
							currentLang === 'vi'
								? getTranslatedName(country.name)
								: country.name
						}
						population={country.population?.value || 0}
						region={country.region}
						capital={country.capital}
						flag={country.flag}
						code={country.cca3}
						isFavorite={favorites.includes(country.cca3)}
						onToggleFavorite={(name, newState) =>
							handleToggleFavorite(country.cca3, newState)
						}
					/>
				))}
			</div>

			{/* Empty State for Smart Search */}
			{smartSearchResults && displayCountries.length === 0 && (
				<div className='text-center py-16'>
					<p className='text-gray-500 dark:text-gray-400 text-lg'>
						{t('no_results') || 'No countries found matching your query'}
					</p>
					<button
						onClick={clearSmartSearch}
						className='mt-4 text-indigo-600 dark:text-indigo-400 hover:underline'>
						{t('show_all') || 'Show all countries'}
					</button>
				</div>
			)}

			{/* Pagination - Only show when not in smart search mode */}
			{!smartSearchResults && (
				<div className='flex justify-center gap-2 mt-15 flex-wrap'>
					<button
						onClick={() => updatePage(1)}
						disabled={page === 1}
						className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 disabled:opacity-50'>
						{'<<'}
					</button>
					{page >= 2 && (
						<button
							onClick={() => updatePage(page - 1)}
							className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200'>
							{page - 1}
						</button>
					)}
					<button className='px-4 py-1 rounded-lg font-medium transition-colors duration-200 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'>
						{page}
					</button>
					{page + 1 < totalPages && (
						<button
							onClick={() => updatePage(page + 1)}
							className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200'>
							{page + 1}
						</button>
					)}
					{page < totalPages - 2 && (
						<button className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200'>
							...
						</button>
					)}
					{page < totalPages && (
						<button
							onClick={() => updatePage(totalPages)}
							className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200'>
							{totalPages}
						</button>
					)}
					<button
						onClick={() => updatePage(totalPages)}
						disabled={page === totalPages}
						className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 disabled:opacity-50'>
						{'>>'}
					</button>
				</div>
			)}
		</>
	);
};

export default CountryList;
