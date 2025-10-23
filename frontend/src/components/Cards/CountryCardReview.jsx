import { IoLanguage, IoLocationOutline } from 'react-icons/io5';
import {
	FiUsers,
	FiMaximize2,
	FiDollarSign,
	FiClock,
	FiGlobe,
} from 'react-icons/fi';

const CountryCardReview = ({ countryDetails }) => {
	return (
		<div className='p-6 space-y-4 dark:bg-gray-700 bg-gray-200 rounded-xl'>
			<div className='relative w-full aspect-[3/2] bg-gray-300 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md'>
				<img
					src={countryDetails.flag}
					alt={countryDetails.name}
					className='absolute inset-0 w-full h-full object-contain'
				/>
			</div>

			<div>
				<h2 className='font-semibold'>{countryDetails.name}</h2>
				<p>{countryDetails.officialName}</p>
			</div>

			<div className='border-t border-gray-400/30 dark:border-gray-500/30 my-4'></div>

			<div className='space-y-3'>
				<div className='flex items-start gap-3'>
					<FiGlobe className='w-4 h-4 sm:w-5 sm:h-5  text-cyan-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Region</p>
						<p>
							{countryDetails.region}
							{countryDetails.subregion && ` (${countryDetails.subregion})`}
						</p>
					</div>
				</div>
				<div className='flex items-start gap-3'>
					<IoLocationOutline className='w-4 h-4 sm:w-5 sm:h-5  text-blue-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Capital</p>
						<p>{countryDetails.capital?.[0] || 'N/A'}</p>
					</div>
				</div>
				<div className='flex items-start gap-3'>
					<FiUsers className='w-4 h-4 sm:w-5 sm:h-5  text-green-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Population</p>
						<p>{countryDetails.population?.toLocaleString() || 'N/A'}</p>
					</div>
				</div>
				<div className='flex items-start gap-3'>
					<FiMaximize2 className='w-4 h-4 sm:w-5 sm:h-5  text-orange-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Area</p>
						<p>
							{countryDetails.area
								? `${countryDetails.area.toLocaleString()} km²`
								: 'N/A'}
						</p>
					</div>
				</div>
				<div className='flex items-start gap-3'>
					<IoLanguage className='w-4 h-4 sm:w-5 sm:h-5  text-pink-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Language</p>
						<p>{countryDetails.languages}</p>
					</div>
				</div>
				<div className='flex items-start gap-3'>
					<FiDollarSign className='w-4 h-4 sm:w-5 sm:h-5  text-emerald-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Currency</p>
						<p>{countryDetails.currencies}</p>
					</div>
				</div>
				<div className='flex items-start gap-3'>
					<FiClock className='w-4 h-4 sm:w-5 sm:h-5  text-indigo-500' />
					<div className='flex-1'>
						<p className='text-gray-600 dark:text-gray-200/80'>Time zones</p>
						<p>{countryDetails.timezones}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default CountryCardReview;
