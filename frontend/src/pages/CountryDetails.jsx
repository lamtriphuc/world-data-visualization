import { IoFlagOutline, IoLanguage, IoLocationOutline } from 'react-icons/io5';
import {
	FiUsers,
	FiMaximize2,
	FiDollarSign,
	FiClock,
	FiGlobe,
} from 'react-icons/fi';
import { GrMoney } from 'react-icons/gr';
import { FaMapPin } from 'react-icons/fa6';
import { LuFlagTriangleRight } from 'react-icons/lu';
import { IoIosHeart, IoMdTrendingUp } from 'react-icons/io';
import MiniMap from '../components/Map/MiniMap';
import { useEffect, useState } from 'react';
import { getCountryDetails } from '../services/country.service';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loading from '../components/Layout/Loading';
import translated from '../scripts/countries_translated.json';
import {
	addFavorite,
	getFavoriteCodes,
	removeFavorite,
} from '../services/auth.service';

const CountryDetails = () => {
	const [countryDetails, setCountryDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [favorites, setFavorites] = useState([]);
	const { code } = useParams();
	const { t } = useTranslation();
	const currentLang = localStorage.getItem('lang');
	const navigate = useNavigate();

	const population_density =
		countryDetails?.population?.value / countryDetails?.area;
	const gdp_per_capita =
		countryDetails?.gdp?.at(-1)?.value / countryDetails?.population?.value;

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
		const fetchCountryDetails = async () => {
			try {
				const response = await getCountryDetails(code);
				setCountryDetails(response);
				window.scrollTo(0, 0);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchCountryDetails();
	}, [code]);

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	const getTranslatedOfficialName = (officialName) => {
		const found = translated.find((c) => c.officialName === officialName);
		return found?.officialName_vi || officialName;
	};

	const toggleFavorite = async (countryCode, newState) => {
		try {
			if (newState) {
				await addFavorite(countryCode);
				setFavorites((prev) => [...prev, countryCode]);
			} else {
				await removeFavorite(countryCode);
				setFavorites((prev) => prev.filter((c) => c !== countryCode));
			}
		} catch (error) {
			console.log('Favorite err: ', error);
		}
	};

	const isFavorite = favorites.includes(countryDetails?.cca3);

	if (loading) return <Loading />;

	return (
		<div className='space-y-8 max-w-[1152px] w-full mx-auto px-4 sm:px-6 lg:px-8'>
			{/* Flag, name */}
			<div className='rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
				<div className='relative h-48 py-30 flex items-center justify-center dark:bg-gray-800 bg-gray-300'>
					<button
						onClick={() => toggleFavorite(countryDetails?.cca3, !isFavorite)}
						className='absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition'>
						{isFavorite ? (
							<IoIosHeart className='text-red-500 text-xl' />
						) : (
							<IoIosHeart className='text-gray-700 text-xl' />
						)}
					</button>
					<img
						className='h-24 sm:h-32 md:h-40 border-4 border-white rounded shadow-2xl object-contain'
						src={countryDetails.flag}
						alt={countryDetails.name}
					/>
				</div>

				<div className='flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 space-y-4 py-8'>
					<p className='font-bold'>
						{currentLang === 'vi'
							? getTranslatedName(countryDetails.name)
							: countryDetails.name}
					</p>
					<p className='text-gray-700 dark:text-gray-300'>
						{currentLang === 'vi'
							? getTranslatedOfficialName(countryDetails.officialName)
							: countryDetails.officialName}
					</p>
					<div className='flex items-center justify-center gap-2'>
						<span
							onClick={() => navigate(`/continent/${countryDetails.region}`)}
							className='px-3 py-1 bg-gray-300 dark:bg-gray-800 rounded-2xl cursor-pointer'
						>
							{t(`main_region.${countryDetails.region}`)}
						</span>
						{countryDetails.subregion && (
							<span className='px-3 py-1 bg-gray-300 dark:bg-gray-800 rounded-2xl'>
								{t(`subregion.${countryDetails.subregion}`)}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8'>
				{/* Capital, population, area, gdp */}
				<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
					<p>{t('basic_information')}</p>
					<div className='mt-10 space-y-4'>
						<div className='flex gap-2'>
							<IoLocationOutline className='w-4 h-4 sm:w-5 sm:h-5  text-blue-500' />
							<div className='flex flex-col'>
								<span>{t('capital')}</span>
								<span>{countryDetails.capital}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiUsers className='w-4 h-4 sm:w-5 sm:h-5  text-green-500' />
							<div className='flex flex-col'>
								<span>
									{t('population')} ({countryDetails.population?.year})
								</span>
								<span>
									{countryDetails.population?.value.toLocaleString() || 0}
								</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiMaximize2 className='w-4 h-4 sm:w-5 sm:h-5  text-orange-500' />
							<div className='flex flex-col'>
								<span>{t('area')}</span>
								<span>{countryDetails.area.toLocaleString()} km²</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiGlobe className='w-4 h-4 sm:w-5 sm:h-5  text-cyan-500' />
							<div className='flex flex-col'>
								<span>{t('region')}</span>
								<span>
									{t(
										`main_region.${countryDetails.region === 'Antarctic'
											? 'Antarctica'
											: countryDetails.region
										}`
									)}
									{countryDetails.subregion &&
										` - ${t(`subregion.${countryDetails.subregion}`)}`}
								</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FaMapPin className='w-4 h-4 sm:w-5 sm:h-5  text-violet-500' />
							<div className='flex flex-col'>
								<span>
									{t('population_density')} ({countryDetails.population?.year})
								</span>
								<span>
									{population_density.toFixed(0)} {t('people')} / km²
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* language, currency, timezones, region */}
				<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)] '>
					<p>{t('cultural_economic')}</p>
					<div className='mt-10 space-y-4'>
						<div className='flex gap-2'>
							<IoLanguage className='w-4 h-4 sm:w-5 sm:h-5  text-pink-500' />
							<div className='flex flex-col'>
								<span>{t('language')}</span>
								<span>{countryDetails.languages.join(', ')}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiDollarSign className='w-4 h-4 sm:w-5 sm:h-5  text-emerald-500' />
							<div className='flex flex-col'>
								<span>{t('currency')}</span>
								<span>{countryDetails.currencies}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiClock className='w-4 h-4 sm:w-5 sm:h-5 text-indigo-500' />
							<div className='flex flex-col'>
								<span>{t('timezone')}</span>
								<div className='flex flex-wrap gap-x-2'>
									{countryDetails.timezones?.map((tz) =>
										tz ? (
											<span key={tz} className='whitespace-nowrap'>
												{tz}
											</span>
										) : null
									)}
								</div>
							</div>
						</div>
						<div className='flex gap-2'>
							<IoMdTrendingUp className='w-4 h-4 sm:w-5 sm:h-5 text-purple-500' />
							<div className='flex flex-col'>
								<span>
									GDP (
									{countryDetails.gdp?.length
										? countryDetails.gdp.at(-1)?.year
										: ''}
									)
								</span>
								<span>
									{countryDetails.gdp.length
										? countryDetails.gdp.at(-1).value.toLocaleString() + ' $'
										: 'N/A'}
								</span>
							</div>
						</div>

						<div className='flex gap-2'>
							<GrMoney className='w-4 h-4 sm:w-5 sm:h-5 text-teal-500' />
							<div className='flex flex-col'>
								<span>
									{t('gdp_per_capita')} (
									{countryDetails.gdp?.length
										? countryDetails.gdp.at(-1)?.year
										: ''}
									)
								</span>
								<span>
									{gdp_per_capita.toFixed(0)} $ / {t('year')}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ISO code */}
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8'>
				<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
					<div className='flex items-center gap-2'>
						<IoFlagOutline />
						<h1>{t('iso_codes')}</h1>
					</div>
					<div className='mt-10 flex gap-20'>
						<div className='flex flex-col space-y-2'>
							<p className='text-gray-800/70 dark:text-gray-50/70'>
								ISO 3166-1 Alpha-2
							</p>
							<div>
								<span className='px-2 py-1 bg-gray-300 dark:bg-gray-800 rounded-lg'>
									{countryDetails.cca2}
								</span>
							</div>
						</div>
						<div className='flex flex-col space-y-2'>
							<p className='text-gray-800/70 dark:text-gray-50/70'>
								ISO 3166-1 Alpha-3
							</p>
							<div>
								<span className='px-2 py-1 bg-gray-300 dark:bg-gray-800 rounded-lg'>
									{countryDetails.cca3}
								</span>
							</div>
						</div>
					</div>
				</div>
				<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
					<div className='flex items-center gap-2'>
						<LuFlagTriangleRight />
						<h1>{t('borders')}</h1>
					</div>
					<div className='mt-10 flex flex-wrap gap-2'>
						{countryDetails.borders?.map((border) => (
							<span
								key={border}
								className='px-2 py-1 bg-gray-300 dark:bg-gray-800 rounded-lg cursor-pointer'
								onClick={() => navigate(`/country/${border}`)}>
								{border}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Location */}
			<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
				<h1>{t('location')}</h1>
				{/* Map box */}
				{countryDetails.latlng?.lat && countryDetails.latlng?.lng && (
					<MiniMap
						lat={countryDetails.latlng?.lat}
						lng={countryDetails.latlng?.lng}
					/>
				)}
			</div>
		</div>
	);
};
export default CountryDetails;
