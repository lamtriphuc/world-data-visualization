import { useTranslation } from 'react-i18next';
import { FaBorderAll } from 'react-icons/fa';
import { getTranslatedName } from '../../ultils';

const TopBordersTable = ({ countries = [] }) => {
	const { t } = useTranslation();

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
		<div className='h-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-100 dark:border-gray-700'>
			<div className='flex items-center gap-2 mb-4'>
				<FaBorderAll className='w-5 h-5 text-indigo-600' />
				<h2 className='text-lg font-semibold text-gray-900 dark:text-gray-200'>
					{t('top_borders') || 'Quốc gia có nhiều biên giới nhất'}
				</h2>
			</div>

			<div className='overflow-x-auto'>
				<table className='table-auto text-left w-full border-collapse'>
					<thead className='text-sm'>
						<tr>
							<th className='w-16 pb-2'>{t('ranking')}</th>
							<th className='w-60 pb-2'>{t('country')}</th>
							<th className='w-40 pb-2 text-right'>
								{t('borders_count') || 'Số lượng biên giới'}
							</th>
						</tr>
					</thead>

					<tbody>
						{countries.map((item, index) => (
							<tr
								key={index}
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
										{localStorage.getItem('lang') === 'vi'
											? getTranslatedName(item.name)
											: item.name}
									</p>
								</td>

								<td className='text-right'>
									<p className='text-gray-900 dark:text-gray-300 font-bold'>
										{item.num_borders}
									</p>
									<p className='text-gray-500 dark:text-gray-400 text-xs'>
										{t('borders')}
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

export default TopBordersTable;
