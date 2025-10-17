import { useState } from 'react';
import { SlMagnifier } from 'react-icons/sl';

const SearchBar = () => {
	const [searchTerm, setSearchTerm] = useState('');

	return (
		<div className='flex items-center w-full gap-3 rounded-sm px-5 py-4 bg-white dark:bg-gray-800 md:max-w-[419px] shadow-[0_4px_20px_hsla(0,0%,0%,10%)]'>
			<SlMagnifier className='text-gray-400' />
			<input
				type='text'
				placeholder='Search for a country...'
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className='w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 
               focus:outline-none'
			/>
		</div>
	);
};
export default SearchBar;
