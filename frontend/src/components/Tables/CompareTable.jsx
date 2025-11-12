import { useTranslation } from 'react-i18next';
import translated from '../../scripts/countries_translated.json';

const CompareTable = ({ countries }) => {
	const { t } = useTranslation();
	const currentLang = localStorage.getItem('lang');

	const fields = [
		{ key: 'name', label: t('name') },
		{ key: 'officialName', label: t('official_name') },
		{ key: 'area', label: `${t('area')} (km²)` },
		{ key: 'population', label: t('population') },
		{ key: 'region', label: t('region') },
		{ key: 'subregion', label: t('sub_region') },
		{ key: 'capital', label: t('capital') },
	];

	const getValue = (obj, path) => {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? '—';
	};

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	const getTranslatedOfficialName = (officialName) => {
		const found = translated.find((c) => c.officialName === officialName);
		return found?.officialName_vi || officialName;
	};

	return (
		<div className='overflow-x-auto mt-4'>
			<table className='table-fixed min-w-full border border-gray-300 dark:border-gray-600 rounded-md text-sm'>
				<thead className='bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'>
					<tr>
						<th className='p-3 text-left border-b border-gray-300 dark:border-gray-600'>
							{t('properties')}
						</th>
						{countries.map((c) => (
							<th
								key={c.cca3}
								className='p-3 text-left border-b border-gray-300 dark:border-gray-600'>
								<div className='flex items-center gap-2'>
									<img
										src={c.flag}
										alt={c.name}
										className='w-6 h-4 object-cover border'
									/>
									{currentLang === 'vi' ? getTranslatedName(c.name) : c.name}
								</div>
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{fields.map((field) => (
						<tr key={field.key} className='odd:bg-white even:bg-gray-50'>
							<td className='p-3 font-medium text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'>
								{field.label}
							</td>
							{countries.map((c) => (
								<td
									key={c.cca3 + field.key}
									className='p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'>
									{field.key === 'region'
										? t(`main_region.${getValue(c, 'region')}`)
										: field.key === 'subregion'
										? t(`subregion.${getValue(c, 'subregion')}`, {
												defaultValue: '-',
										  })
										: field.key === 'name'
										? getTranslatedName(getValue(c, 'name'))
										: field.key === 'officialName'
										? getTranslatedOfficialName(getValue(c, 'officialName'))
										: getValue(c, field.key)?.toLocaleString?.() ||
										  getValue(c, field.key)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
export default CompareTable;
