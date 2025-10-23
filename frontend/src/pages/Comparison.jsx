import { useEffect, useState } from 'react';
import CountryCardReview from '../components/Cards/CountryCardReview';
import {
	getAllCountries,
	getCountryDetails,
} from '../services/country.service';
import { SlArrowDown } from 'react-icons/sl';

const Comparison = () => {
	const [countries, setCountries] = useState([]);
	const [countryCode, setCountryCode] = useState(null);
	const [countryDetails, setCountryDetails] = useState(null);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const response = await getAllCountries({ limit: 0 });
				setCountries(response.data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchCountries();
	}, []);

	const handelValueChange = (e) => {
		setCountryCode(e.target.value);
	};

	useEffect(() => {
		const fetchCountryDetails = async () => {
			if (!countryCode) return;

			try {
				const response = await getCountryDetails(countryCode);
				setCountryDetails(response);
			} catch (error) {
				console.error(error);
			}
		};
		fetchCountryDetails();
	}, [countryCode]);

	return (
		<div className='max-w-7xl mx-auto space-y-8'>
			{/* Selectors */}
			<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
				<div className='flex flex-col w-full relative'>
					<label className='mb-4'>First country</label>
					<select
						onChange={handelValueChange}
						className='appearance-none w-full p-2 rounded-md border dark:border-gray-600 
					bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
					focus:outline-none cursor-pointer pr-10'>
						<option selected disabled hidden>
							Select a country...
						</option>
						{countries.map((country) => (
							<option value={country.cca3}>{country.name}</option>
						))}
					</select>
					<SlArrowDown className='absolute right-4 top-13 text-gray-400 pointer-events-none' />
				</div>
				{/* icons */}
				<div className='flex flex-col w-full relative'>
					<label className='mb-4'>Second Country</label>
					<select
						onChange={handelValueChange}
						className='appearance-none w-full p-2 rounded-md border dark:border-gray-600 
					bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
					focus:outline-none cursor-pointer pr-10'>
						<option selected disabled hidden>
							Select a country...
						</option>
						{countries.map((country) => (
							<option value={country.cca3}>{country.name}</option>
						))}
					</select>
					<SlArrowDown className='absolute right-4 top-13 text-gray-400 pointer-events-none' />
				</div>
			</div>

			{/* Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
				{countryDetails === null ? (
					<p>Please select a country</p>
				) : (
					<>
						<CountryCardReview countryDetails={countryDetails} />
						<CountryCardReview countryDetails={countryDetails} />
					</>
				)}
			</div>
		</div>
	);
};

export default Comparison;
