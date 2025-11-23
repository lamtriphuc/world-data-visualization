import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

const CountryList = () => {
	// States
	const [countries, setCountries] = useState([]);
	const [allCountries, setAllCountries] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [favorites, setFavorites] = useState([]);

	// Hooks
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
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
		if (page !== 1) {
			updatePage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [regionParam, subregionParam, sortByParam, sortOrderParam]);

	// Fetch paginated countries based on filters
	useEffect(() => {
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
	}, [page, regionParam, subregionParam, sortByParam, sortOrderParam]);

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

	if (loading) return <Loading />;

	return (
		<>
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
				{countries.map((country) => (
					<CountryCard
						key={country.cca3}
						name={
							currentLang === 'vi'
								? getTranslatedName(country.name)
								: country.name
						}
						population={country.population.value}
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

			{/* Pagination */}
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
		</>
	);
};

export default CountryList;
