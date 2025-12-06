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
	]);

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
				<div className='relative w-full md:max-w-[419px]'>
					<CountrySearch
						countries={allCountries}
						onSelect={handleCountrySelect}
					/>
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
