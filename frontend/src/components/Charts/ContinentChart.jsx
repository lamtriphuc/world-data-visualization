import { useTranslation } from 'react-i18next';
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';

const ContinentChart = ({ chartData }) => {
	const { t } = useTranslation();

	const COLORS = {
		Africa: '#3b82f6',
		Americas: '#10b981',
		Asia: '#f59e0b',
		Europe: '#8b5cf6',
		Oceania: '#ec4899',
		Antarctic: '#06b6d4',
	};

	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			const chartData = payload[0].payload;
			return (
				<div className='bg-white p-3 rounded-lg shadow-lg border border-gray-200'>
					<p className='text-gray-900'>
						{t(
							`main_region.${chartData.name === 'Antarctic' ? 'Antarctica' : chartData.name
							}`
						)}
					</p>
					<p className='text-gray-600'>
						{t('country_num')}: {chartData.value}
					</p>
					<p className='text-gray-600'>
						{t('percentage')}: {chartData.percentage}%
					</p>
				</div>
			);
		}
	};

	return (
		<div className='w-full h-full flex flex-col'>
			<div className='flex-1 min-h-[250px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<PieChart>
						<Pie
							isAnimationActive={true}
							data={chartData}
							dataKey='value'
							nameKey='name'
							cx='50%'
							cy='50%'
							outerRadius='80%'
							fill='#8884d8'
						// label={({ name, percentage }) =>
						// 	`${t(
						// 		`main_region.${name === 'Antarctic' ? 'Antarctica' : name}`
						// 	)} (${percentage}%)`
						// }
						// labelLine={true}
						>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
					</PieChart>
				</ResponsiveContainer>
			</div>

			<div className='mt-4 grid grid-cols-2 gap-x-4 gap-y-2'>
				{chartData.map((item) => (
					<div key={item.name} className='flex items-center gap-2'>
						<div
							className='w-3 h-3 rounded-full'
							style={{ backgroundColor: COLORS[item.name] }}
						/>
						<div className='flex-1 overflow-hidden'>
							<p className='text-gray-700 dark:text-gray-300 text-sm truncate font-medium'>
								{t(
									`main_region.${item.name === 'Antarctic' ? 'Antarctica' : item.name
									}`
								)}
							</p>
							<p className='text-gray-500 dark:text-gray-400 text-xs'>
								{item.value} {t('countries')}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ContinentChart;
