import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import translated from '../../scripts/countries_translated.json';

const CountrySearch = ({ countries, onSelect }) => {
	const [query, setQuery] = useState('');
	const [filteredCountries, setFilteredCountries] = useState([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState(null);
	const { t } = useTranslation();

	const inputRef = useRef();

	useEffect(() => {
		if (query === '') {
			setFilteredCountries(countries.slice(0, 100));
		} else {
			const filtered = countries
				.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 100);
			setFilteredCountries(filtered);
		}
	}, [query, countries]);

	const handleSelect = (country) => {
		setSelectedCountry(country);
		setQuery(country.name);
		setShowDropdown(false);
		onSelect(country);
	};

	// Ẩn dropdown khi click ra ngoài
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (inputRef.current && !inputRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	return (
		<div className='relative w-full md:w-72' ref={inputRef}>
			<input
				type='text'
				className='w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800  py-2 pl-3 pr-10 text-gray-900 shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-gray-300'
				placeholder={t('search_placeholder')}
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setShowDropdown(true);
				}}
				onFocus={() => setShowDropdown(true)}
			/>
			{showDropdown && filteredCountries.length > 0 && (
				<ul className=' absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm dark:bg-gray-800'>
					{filteredCountries.map((country) => (
						<li
							key={country.cca3}
							className='cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white'
							onClick={() => handleSelect(country)}>
							{getTranslatedName(country.name)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default CountrySearch;
