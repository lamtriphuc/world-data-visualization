import { useTranslation } from 'react-i18next';
import { SlArrowDown } from 'react-icons/sl';
import { useSearchParams } from 'react-router-dom';

const groupedSubregions = {
	Africa: [
		'Northern Africa',
		'Western Africa',
		'Middle Africa',
		'Eastern Africa',
		'Southern Africa',
	],
	Americas: ['North America', 'Central America', 'South America', 'Caribbean'],
	Asia: [
		'Central Asia',
		'Eastern Asia',
		'South-Eastern Asia',
		'Southern Asia',
		'Western Asia',
	],
	Europe: [
		'Northern Europe',
		'Southern Europe',
		'Eastern Europe',
		'Western Europe',
	],
	Oceania: [
		'Australia and New Zealand',
		'Melanesia',
		'Micronesia',
		'Polynesia',
	],
	Antarctic: []
};

const FilterRegionSubregion = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();

	const handleFilterChange = (e) => {
		const value = e.target.value;

		if (value === 'all') {
			setSearchParams('');
			return;
		}

		if (Object.keys(groupedSubregions).includes(value)) {
			searchParams.set('region', value);
			searchParams.delete('subregion');
		} else {
			searchParams.set('subregion', value);

			const region = Object.entries(groupedSubregions).find(([region, subs]) =>
				subs.includes(value)
			)?.[0];
			if (region) searchParams.set('region', region);
		}

		setSearchParams(searchParams);
	};

	const currentRegion = searchParams.get('region');
	const currentSubregion = searchParams.get('subregion');
	const currentValue = currentSubregion || currentRegion || '';

	return (
		<div className='relative inline-flex items-center shadow-[0_4px_20px_hsla(0,0%,0%,10%)]'>
			<select
				id='region-subregion'
				value={currentValue}
				onChange={handleFilterChange}
				className='appearance-none w-74 px-6 py-3 rounded-md border dark:border-gray-600 
					bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
					focus:outline-none cursor-pointer pr-10'>
				<option value='' disabled hidden selected>
					{t('filter_region')}
				</option>
				<option value='all'>{t('all')}</option>

				{Object.entries(groupedSubregions).map(([region, subs]) => (
					<>
						<option className='font-bold' value={region}>
							{t(`main_region.${region}`)}
						</option>
						{subs.map((sub) => (
							<option key={sub} value={sub}>
								&nbsp;&nbsp; {t(`subregion.${sub}`)}
							</option>
						))}
					</>
				))}
			</select>

			<SlArrowDown className='absolute right-4 text-gray-400 pointer-events-none' />
		</div>
	);
};

export default FilterRegionSubregion;
