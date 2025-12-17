import { useTranslation } from 'react-i18next';

const RegionFilter = ({ regions, selectedRegion, onFilterChange }) => {
	const allRegions = ['All', ...regions];
	const { t } = useTranslation();

	return (
		<div className='flex flex-wrap gap-4 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700 z-20'>
			{allRegions.map((region) => {
				const isSelected = region === selectedRegion;
				return (
					<button
						key={region}
						onClick={() => onFilterChange(region)}
						className={`
              px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${isSelected
								? 'bg-indigo-600 text-white shadow-lg'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}
            `}>
						{region === 'All'
							? 'All'
							: region === 'Antarctica'
								? t(`main_region.Antarctic`)
								: t(`main_region.${region}`)}
					</button>
				);
			})}
		</div>
	);
};

export default RegionFilter;
