import { useTranslation } from 'react-i18next';
import { SlArrowDown } from 'react-icons/sl';
import { useSearchParams } from 'react-router-dom';

const SortOptions = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();

	const handleSortChange = (e) => {
		const value = e.target.value;

		if (value === '') {
			searchParams.delete('sortBy');
			searchParams.delete('sortOrder');
		} else {
			const [sortBy, sortOrder] = value.split('_');
			searchParams.set('sortBy', sortBy);
			searchParams.set('sortOrder', sortOrder);
		}

		setSearchParams(searchParams);
	};

	const currentSortBy = searchParams.get('sortBy');
	const currentSortOrder = searchParams.get('sortOrder');
	const currentValue =
		currentSortBy && currentSortOrder
			? `${currentSortBy}_${currentSortOrder}`
			: '';

	return (
		<div className='relative inline-flex items-center shadow-[0_4px_20px_hsla(0,0%,0%,10%)]'>
			<select
				id='sort-options'
				value={currentValue}
				onChange={handleSortChange}
				className='appearance-none w-74 px-6 py-3 rounded-md border dark:border-gray-600 
					bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
					focus:outline-none cursor-pointer pr-10'>
				<option value='' disabled hidden>
					{t('sort_by')}
				</option>
				<option value=''>{t('default')}</option>
				<option value='population_1'>{t('population_ascending')}</option>
				<option value='population_-1'>{t('population_descending')}</option>
				<option value='area_1'>{t('area_ascending')}</option>
				<option value='area_-1'>{t('area_descending')}</option>
			</select>

			<SlArrowDown className='absolute right-4 text-gray-400 pointer-events-none' />
		</div>
	);
};

export default SortOptions;
