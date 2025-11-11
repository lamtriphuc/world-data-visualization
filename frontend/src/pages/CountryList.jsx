import { Link, useSearchParams } from 'react-router-dom';
import CountryCard from '../components/Cards/CountryCard';
import { useEffect, useState } from 'react';
import { getAllCountries } from '../services/country.service';
import RegionDropdown from '../components/Layout/RegionDropdown';
import { SlMagnifier } from 'react-icons/sl';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../hooks/useDebounce';
import Loading from '../components/Layout/Loading';

const CountryList = () => {
	const [countries, setCountries] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState();
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(true);
	const debouncedSearch = useDebounce(searchTerm, 500);
	const { t } = useTranslation();

	const regionParam = searchParams.get('region')
		? `&region=${searchParams.get('region')}`
		: '';
	const subregionParam = searchParams.get('subregion')
		? `&subregion=${searchParams.get('subregion')}`
		: '';
	const searchParam = debouncedSearch ? `&search=${debouncedSearch}` : '';

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await getAllCountries({
					page,
					region: regionParam,
					subregion: subregionParam,
					search: searchParam,
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
	}, [page, regionParam, subregionParam, searchParam]);

	if (loading) return <Loading />;

	return (
		<>
			<div className='flex flex-col items-start justify-between w-full md:flex-row md:items-center pb-8'>
				<div className='flex items-center w-full gap-3 rounded-sm px-5 py-4 bg-white dark:bg-gray-800 md:max-w-[419px] shadow-[0_4px_20px_hsla(0,0%,0%,10%)]'>
					<SlMagnifier className='text-gray-400' />
					<input
						type='text'
						placeholder={t('search_placeholder')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 
											 focus:outline-none'
					/>
				</div>
				<RegionDropdown />
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
				{countries.map((country) => (
					<Link to={`/country/${country.cca3}`}>
						<CountryCard
							name={country.name}
							population={country.population.toLocaleString()}
							region={country.region}
							capital={country.capital}
							flag={country.flag}
						/>
					</Link>
				))}
			</div>
			<div className='flex justify-center gap-2 mt-15 flex-wrap'>
				<button
					onClick={() => setPage(1)}
					disabled={page === 1}
					className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 disabled:opacity-50'>
					{'<<'}
				</button>
				<button
					onClick={() => setPage(page - 1)}
					disabled={page === 1}
					className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 disabled:opacity-50'>
					{'<'}
				</button>
				{page >= 2 && (
					<button
						onClick={() => setPage(page - 1)}
						className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200'>
						{page - 1}
					</button>
				)}
				<button
					className={`px-4 py-1 rounded-lg font-medium transition-colors duration-200 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200`}>
					{page}
				</button>
				{page < totalPages && (
					<button
						onClick={() => setPage(page + 1)}
						className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200'>
						{page + 1}
					</button>
				)}
				<button
					onClick={() => setPage(page + 1)}
					disabled={page === totalPages}
					className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 disabled:opacity-50'>
					{'>'}
				</button>
				<button
					onClick={() => setPage(totalPages)}
					disabled={page === totalPages}
					className='px-3 py-1 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 disabled:opacity-50'>
					{'>>'}
				</button>
			</div>
		</>
	);
};
export default CountryList;
