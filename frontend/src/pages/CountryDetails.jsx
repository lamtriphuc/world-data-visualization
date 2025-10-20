import { IoFlagOutline, IoLanguage, IoLocationOutline } from 'react-icons/io5';
import {
	FiUsers,
	FiMaximize2,
	FiDollarSign,
	FiClock,
	FiGlobe,
} from 'react-icons/fi';
import { LuFlagTriangleRight } from 'react-icons/lu';
import { IoMdTrendingUp } from 'react-icons/io';
import MiniMap from '../components/Map/MiniMap';
import { useEffect, useState } from 'react';
import { getCountryDetails } from '../services/country.service';
import { useParams } from 'react-router-dom';

const CountryDetails = () => {
	const [countryDetails, setCountryDetails] = useState(null);
	const { code } = useParams();

	useEffect(() => {
		const fetchCountryDetails = async () => {
			try {
				const response = await getCountryDetails(code);
				setCountryDetails(response);
			} catch (error) {
				console.error(error);
			}
		};
		fetchCountryDetails();
	}, [code]);

	if (!countryDetails) {
		return <div>Loading...</div>;
	}

	return (
		<div className='space-y-8 max-w-[1152px] w-full mx-auto px-4 sm:px-6 lg:px-8'>
			{/* Flag, name */}
			<div className='rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
				<div className='relative h-48 py-30 flex items-center justify-center dark:bg-gray-800 bg-gray-300'>
					<img
						className='h-24 sm:h-32 md:h-40 border-4 border-white rounded shadow-2xl object-contain'
						src={countryDetails.flag}
						alt={countryDetails.name}
					/>
				</div>

				<div className='flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 space-y-4 py-8'>
					<p className='font-bold'>{countryDetails.name}</p>
					<p className='text-gray-700 dark:text-gray-300'>
						{countryDetails.officialName}
					</p>
					<div className='flex items-center justify-center gap-2'>
						<span className='px-3 py-1 bg-gray-300 dark:bg-gray-800 rounded-2xl'>
							{countryDetails.region}
						</span>
						<span className='px-3 py-1 bg-gray-300 dark:bg-gray-800 rounded-2xl'>
							{countryDetails.subregion}
						</span>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8'>
				{/* Capital, population, area, gdp */}
				<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
					<p>Basic Information</p>
					<div className='mt-10 space-y-4'>
						<div className='flex gap-2'>
							<IoLocationOutline className='w-4 h-4 sm:w-5 sm:h-5  text-blue-500' />
							<div className='flex flex-col'>
								<span>Capital</span>
								<span>{countryDetails.capital}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiUsers className='w-4 h-4 sm:w-5 sm:h-5  text-green-500' />
							<div className='flex flex-col'>
								<span>Population</span>
								<span>{countryDetails.population}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiMaximize2 className='w-4 h-4 sm:w-5 sm:h-5  text-orange-500' />
							<div className='flex flex-col'>
								<span>Area</span>
								<span>{countryDetails.area} km²</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<IoMdTrendingUp className='w-4 h-4 sm:w-5 sm:h-5  text-purple-500' />
							<div className='flex flex-col'>
								<span>GDP (Nominal)</span>
								<span>$777.83B (2024)</span>
							</div>
						</div>
					</div>
				</div>

				{/* language, currency, timezones, region */}
				<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)] '>
					<p>Cultural & Economic</p>
					<div className='mt-10 space-y-4'>
						<div className='flex gap-2'>
							<IoLanguage className='w-4 h-4 sm:w-5 sm:h-5  text-pink-500' />
							<div className='flex flex-col'>
								<span>Language</span>
								<span>{countryDetails.languages}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiDollarSign className='w-4 h-4 sm:w-5 sm:h-5  text-emerald-500' />
							<div className='flex flex-col'>
								<span>Currency</span>
								<span>{countryDetails.currencies}</span>
							</div>
						</div>
						<div className='flex gap-2'>
							<FiClock className='w-4 h-4 sm:w-5 sm:h-5  text-indigo-500' />
							<div className='flex flex-col'>
								<span>Timezones</span>
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
							<FiGlobe className='w-4 h-4 sm:w-5 sm:h-5  text-cyan-500' />
							<div className='flex flex-col'>
								<span>Region</span>
								<span>
									{countryDetails.region} - {countryDetails.subregion}
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
						<h1>ISO Codes</h1>
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
						<h1>Borders</h1>
					</div>
					<div className='mt-10 flex flex-wrap gap-2'>
						{countryDetails.borders?.map((border) => (
							<span
								key={border}
								className='px-2 py-1 bg-gray-300 dark:bg-gray-800 rounded-lg'>
								{border}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Location */}
			<div className='flex flex-col bg-gray-200 dark:bg-gray-700 p-6 sm:p-8 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1),_0_20px_40px_rgba(0,0,0,0.05)]'>
				<h1>Location</h1>
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
