import { useSearchParams } from 'react-router-dom';
import CountryCard from '../components/Cards/CountryCard';
import { useEffect, useState } from 'react';
import { getAllCountries } from '../services/country.service';
import RegionDropdown from '../components/Layout/RegionDropdown';
import { SlMagnifier } from 'react-icons/sl';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import Loading from '../components/Layout/Loading';
import {
	addFavorite,
	getFavoriteCodes,
	removeFavorite,
} from '../services/auth.service';
import translated from '../scripts/countries_translated.json';
import SortOptions from '../components/Layout/SortOptions';

const CountryList = () => {
	const [countries, setCountries] = useState([]);
	const [totalPages, setTotalPages] = useState();
	const [loading, setLoading] = useState(true);

	const [searchTerm, setSearchTerm] = useState('');
	const [appliedSearch, setAppliedSearch] = useState('');
	const debouncedSuggest = useDebounce(searchTerm, 300);

	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();
	const [favorites, setFavorites] = useState([]);
	const currentLang = localStorage.getItem('lang');

	// Get page from URL or default to 1
	const page = parseInt(searchParams.get('page')) || 1;

	const regionParam = searchParams.get('region')
		? `&region=${searchParams.get('region')}`
		: '';
	const subregionParam = searchParams.get('subregion')
		? `&subregion=${searchParams.get('subregion')}`
		: '';
	const searchParam = appliedSearch ? `&search=${appliedSearch}` : '';
	const sortByParam = searchParams.get('sortBy')
		? `&sortBy=${searchParams.get('sortBy')}`
		: '';
	const sortOrderParam = searchParams.get('sortOrder')
		? `&sortOrder=${searchParams.get('sortOrder')}`
		: '';

	useEffect(() => {
		const fetchFavorites = async () => {
			const token = localStorage.getItem('token');
			if (!token) return;

			try {
				const data = await getFavoriteCodes();
				setFavorites(data);
			} catch (error) {
				console.log('Get favorite fail: ', error);
			}
		};

		fetchFavorites();
	}, []);

	useEffect(() => {
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
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchCountries();
	}, [
		page,
		regionParam,
		subregionParam,
		searchParam,
		sortByParam,
		sortOrderParam,
	]);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (!debouncedSuggest) {
				setSuggestions([]);
				setShowSuggestions(false);
				return;
			}

			try {
				const res = await getAllCountries({
					page: 1,
					search: `&search=${debouncedSuggest}`,
				});

				const list = res.data.slice(0, 7);
				setSuggestions(list);

				const onlyOne = list.length === 1;
				const exactMatch =
					searchTerm.trim().toLowerCase() === list[0]?.name.toLowerCase();

				if (onlyOne && exactMatch) {
					setShowSuggestions(false);
					return;
				}

				setShowSuggestions(true);
			} catch (err) {
				console.log('Suggestion error:', err);
			}
		};

		fetchSuggestions();
	}, [debouncedSuggest, searchTerm]);

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

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	// Function to update page in URL
	const updatePage = (newPage) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', newPage.toString());
		setSearchParams(params);
	};

	if (loading) return <Loading />;

	const handleToggleFavorite = async (countryCode, newState) => {
		try {
			if (newState) {
				await addFavorite(countryCode);
			} else {
				await removeFavorite(countryCode);
			}
		} catch (error) {
			console.log('Favorite err: ', error);
		}
	};

	return (
		<>
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
				<button
					className={`px-4 py-1 rounded-lg font-medium transition-colors duration-200 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200`}>
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
