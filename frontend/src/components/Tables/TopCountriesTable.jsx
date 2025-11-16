import { useTranslation } from 'react-i18next';
import { FiMapPin } from 'react-icons/fi';
import { GoTrophy } from 'react-icons/go';
import { LuUsers } from 'react-icons/lu';
import translated from '../../scripts/countries_translated.json';

const TopCountriesTable = ({
	countries,
	type,
	topListType,
	onTopListTypeChange,
}) => {
	const { t } = useTranslation();
	const currentLang = localStorage.getItem('lang');

	const formatNumber = (num) => {
		return new Intl.NumberFormat('vi-VN').format(num);
	};

	const formatArea = (area) => {
		return `${formatNumber(area)} km²`;
	};

	const formatPopulation = (pop) => {
		if (pop >= 1_000_000_000) {
			return `${(pop / 1_000_000_000).toFixed(2)} ${t('billion')}`;
		} else if (pop >= 1_000_000) {
			return `${(pop / 1_000_000).toFixed(2)} ${t('million')}`;
		}
		return formatNumber(pop);
	};

	const getRankColor = (rank) => {
		if (rank === 1) return 'bg-yellow-100 text-yellow-700';
		if (rank === 2) return 'bg-gray-100 text-gray-700';
		if (rank === 3) return 'bg-orange-100 text-orange-700';
		return 'bg-blue-50 text-blue-700';
	};

	const getRankIcon = (rank) => {
		if (rank <= 3) {
			return <GoTrophy className='w-4 h-4' />;
		}
		return null;
	};

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	return (
		<div className='mt-6 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl'>
			<div className='flex items-center gap-2 mb-4'>
				{type === 'population' ? (
					<LuUsers className='w-5 h-5 text-blue-600' />
				) : (
					<FiMapPin className='w-5 h-5 text-green-600' />
				)}
				<select
					value={topListType}
					onChange={(e) => onTopListTypeChange(e.target.value)}
					className="block w-auto text-base rounded-md border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
				>
					<option value="population">{t('top_10_population')}</option>
					<option value="area">{t('top_10_area')}</option>
				</select>
			</div>
			<div className='overflow-x-auto'>
				<table className='table-auto text-left w-full border-collapse'>
					<thead className='text-sm'>
						<tr>
							<th className='w-16 pb-2'>{t('ranking')}</th>
							<th className='w-16 pb-2'>{t('flag')}</th>
							<th className='w-50 pb-2'>{t('country')}</th>
							<th className='w-20 pb-2'>{t('region')}</th>
							<th className='w-40 pb-2 text-right'>
								{type === 'population' ? t('population') : t('area')}
							</th>
						</tr>
					</thead>
					<tbody>
						{countries.map((country, index) => (
							<tr
								key={country.cca3}
								className='border-t border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
								<td className='py-2'>
									<div
										className={`flex items-center justify-center gap-1 w-10 h-10 rounded-lg ${getRankColor(
											index + 1
										)}`}>
										{getRankIcon(index + 1)}
										<span>{index + 1}</span>
									</div>
								</td>
								<td>
									<img
										src={country.flag}
										alt={`Cờ ${country.name.common}`}
										className='w-12 h-8 object-cover rounded border border-gray-200'
									/>
								</td>
								<td>
									<div>
										<p className='text-gray-900 dark:text-gray-300'>
											{currentLang === 'vi'
												? getTranslatedName(country.name)
												: country.name}
										</p>
										<p className='text-gray-500 dark:text-gray-400 text-sm'>
											{country.cca3}
										</p>
									</div>
								</td>
								<td>
									<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800'>
										{t(`main_region.${country.region}`)}
									</span>
								</td>
								<td>
									<div className='text-right'>
										<p className='text-gray-900 dark:text-gray-300'>
											{type === 'population'
												? formatPopulation(country.population.value)
												: formatArea(country.area)}
										</p>
										<p className='text-gray-500 dark:text-gray-400 text-xs'>
											{type === 'population'
												? formatNumber(country.population.value)
												: formatNumber(country.area) + ' km²'}
										</p>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default TopCountriesTable;
