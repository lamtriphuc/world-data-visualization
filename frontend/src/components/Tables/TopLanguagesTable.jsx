import { useTranslation } from 'react-i18next';
import { LuLanguages } from 'react-icons/lu';

const TopLanguagesTable = ({ languages = [] }) => {
	const { t } = useTranslation();

	const formatNumber = (num) => {
		return new Intl.NumberFormat('vi-VN').format(num);
	};

	const getRankColor = (rank) => {
		if (rank === 1) return 'bg-yellow-100 text-yellow-700';
		if (rank === 2) return 'bg-gray-100 text-gray-700';
		if (rank === 3) return 'bg-orange-100 text-orange-700';
		return 'bg-blue-50 text-blue-700';
	};

	const getRankIcon = (rank) => {
		if (rank <= 3) {
			return <span>🏆</span>;
		}
		return null;
	};

	return (
		<div className='mt-6 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl'>
			<div className='flex items-center gap-2 mb-4'>
				<LuLanguages className='w-5 h-5 text-purple-600' />
				<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-200'>
					{t('top_10_languages')}
				</h2>
			</div>

			<div className='overflow-x-auto'>
				<table className='table-auto text-left w-full border-collapse'>
					<thead className='text-sm'>
						<tr>
							<th className='w-16 pb-2'>{t('ranking')}</th>
							<th className='w-60 pb-2'>{t('language')}</th>
							<th className='w-40 pb-2 text-right'>{t('countries_use')}</th>
						</tr>
					</thead>

					<tbody>
						{languages.map((item, index) => (
							<tr
								key={item._id}
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
									<p className='text-gray-900 dark:text-gray-300 font-medium'>
										{t(`top_languages.${item._id}`, item._id)}
									</p>
								</td>

								<td className='text-right'>
									<p className='text-gray-900 dark:text-gray-300'>
										{formatNumber(item.count)}
									</p>
									<p className='text-gray-500 dark:text-gray-400 text-xs'>
										{t('countries')}
									</p>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default TopLanguagesTable;
