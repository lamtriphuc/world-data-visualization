import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const PopulationAreaChart = ({ population, area }) => {
	const { t } = useTranslation();
	const data = [
		{ name: t('population'), value: population },
		{ name: `${t('area')} (km²)`, value: area },
	];

	return (
		<div className='w-full flex justify-center'>
			<PieChart width={350} height={300}>
				<Pie
					data={data}
					dataKey='value'
					nameKey='name'
					cx='50%'
					cy='50%'
					outerRadius={100}
					label>
					<Cell fill='#8884d8' />
					<Cell fill='#82ca9d' />
				</Pie>
				<Tooltip formatter={(value) => value.toLocaleString()} />
				<Legend />
			</PieChart>
		</div>
	);
};

export default PopulationAreaChart;
