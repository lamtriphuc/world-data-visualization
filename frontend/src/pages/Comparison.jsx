<<<<<<< Updated upstream
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

=======
import { useState } from 'react';
import { FaX } from 'react-icons/fa6';
import CompareTable from '../components/Tables/CompareTable';
import CompareChart from '../components/Charts/CompareChart';

const Comparison = () => {
	const countries = [
		{ cca3: 'VN', label: 'Việt Nam' },
		{ cca3: 'US', label: 'Mỹ' },
		{ cca3: 'JP', label: 'Nhật Bản' },
		{ cca3: 'KR', label: 'Hàn Quốc' },
		{ cca3: 'CN', label: 'Trung Quốc' },
	];

	const fakeCountries = [
		{
			cca3: 'VN',
			name: {
				common: 'Việt Nam',
				official: 'Cộng hòa Xã hội Chủ nghĩa Việt Nam',
			},
			area: 331212,
			population: 98000000,
			region: 'Asia',
			subregion: 'South-Eastern Asia',
			capital: ['Hà Nội'],
			flags: { png: 'https://flagcdn.com/w320/vn.png' },
		},
		{
			cca3: 'US',
			name: { common: 'Hoa Kỳ', official: 'Hợp chủng quốc Hoa Kỳ' },
			area: 9833520,
			population: 331000000,
			region: 'Americas',
			subregion: 'North America',
			capital: ['Washington D.C.'],
			flags: { png: 'https://flagcdn.com/w320/us.png' },
		},
		{
			cca3: 'JP',
			name: { common: 'Nhật Bản', official: 'Quốc gia Nhật Bản' },
			area: 377975,
			population: 125000000,
			region: 'Asia',
			subregion: 'Eastern Asia',
			capital: ['Tokyo'],
			flags: { png: 'https://flagcdn.com/w320/jp.png' },
		},
	];

	const [selectedCountries, setSelectedCountries] = useState([]);
	const maxCountries = 3;

	const handleAddCountry = (index, countryCode) => {
		const updated = [...selectedCountries];
		updated[index] = countryCode;
		setSelectedCountries(updated.slice(0, maxCountries));
	};

	const handleCompare = () => {};

	return (
		<>
			<div className='p-6 '>
				<div className='space-y-4  bg-white dark:bg-gray-800 p-4  rounded-sm'>
					<div className='flex items-center justify-between'>
						<h2 className='text-gray-900 dark:text-gray-300'>Chọn quốc gia</h2>
						{selectedCountries.length > 0 && (
							<button className='flex items-center px-2 py-1 text-sm border border-gray-900 rounded-md text-gray-900 hover:bg-gray-100 hover:border-gray-500 transition cursor-pointer'>
								<FaX className='w-4 h-4 mr-2' />
								Xóa tất cả
							</button>
						)}
					</div>

					{/* Thẻ selêct */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 '>
						{Array.from({ length: maxCountries }).map((_, index) => (
							<div key={index} className='flex flex-col'>
								<label className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
									Quốc gia {index + 1}
									{index === 0 && <span className='text-red-500 ml-1'>*</span>}
								</label>

								<select
									id={`country-${index}`}
									value={selectedCountries[index] || ''}
									onChange={(e) => handleAddCountry(index, e.target.value)}
									disabled={index > 0 && !selectedCountries[index - 1]}
									className={`border border-gray-300 dark:bg-gray-800 rounded-md p-2 text-sm focus:outline-none focus:ring-2 ${
										index > 0 && !selectedCountries[index - 1]
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: 'focus:ring-blue-500'
									}`}>
									<option value=''>-- Chọn quốc gia --</option>
									{countries.map((c) => (
										<option key={c.cca3} value={c.cca3}>
											{c.label}
										</option>
									))}
								</select>
							</div>
						))}
					</div>
					<div className='flex justify-center p-4'>
						<button
							className='p-2 rounded-md bg-blue-400 text-black dark:text-white w-100'
							onClick={handleCompare}>
							So sánh
						</button>
					</div>
				</div>
				{/* compare table */}
				<div className='bg-white dark:bg-gray-800 p-4 mt-4 rounded-sm'>
					<p className='text-center text-xl font-bold text-gray-800 dark:text-gray-300'>
						Bảng so sánh
					</p>
					<CompareTable countries={fakeCountries} />
				</div>

				{/* compare chart */}
				<div className='bg-white dark:bg-gray-800 p-4 mt-4 rounded-sm'>
					<p className='text-center text-xl font-bold text-gray-800 dark:text-gray-300'>
						Biểu đồ so sánh
					</p>
					<CompareChart />
				</div>
			</div>
		</>
	);
};
>>>>>>> Stashed changes
export default Comparison;
