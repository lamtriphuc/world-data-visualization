import { useState } from 'react';
import { SlArrowDown } from 'react-icons/sl';

const FilterDropdown = () => {
	const [selectedRegion, setSelectedRegion] = useState('');

	return (
		<div className='relative inline-flex items-center shadow-[0_4px_20px_hsla(0,0%,0%,10%)]'>
			<select
				name='region'
				value={selectedRegion || ''}
				onChange={(e) => setSelectedRegion(e.target.value)}
				className='appearance-none w-48 px-6 py-3 rounded-md borde dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer pr-10'>
				<option value='' disabled hidden selected>
					Filter by Region
				</option>
				<option value='africa'>Africa</option>
				<option value='americas'>Americas</option>
				<option value='asia'>Asia</option>
				<option value='europe'>Europe</option>
				<option value='oceania'>Oceania</option>
			</select>
			<SlArrowDown className='absolute right-4 text-gray-400 pointer-events-none' />
		</div>
	);
};
export default FilterDropdown;
