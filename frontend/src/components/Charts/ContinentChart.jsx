import React from 'react';
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';

const ContinentChart = ({ chartData }) => {
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
					<p className='text-gray-900'>{chartData.name}</p>
					<p className='text-gray-600'>Số quốc gia: {chartData.value}</p>
					<p className='text-gray-600'>Tỷ lệ: {chartData.percentage}%</p>
				</div>
			);
		}
	};

	return (
		<div className='mt-6 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl'>
			<h2 className='text-gray-900 dark:text-gray-300 mb-4'>
				Phân Bố Quốc Gia Theo Châu Lục
			</h2>
			<ResponsiveContainer width='100%' height={300}>
				<PieChart>
					<Pie
						data={chartData}
						dataKey='value'
						nameKey='name'
						cx='50%'
						cy='50%'
						fill='#8884d8'
						label={({ name, percentage }) => `${name} (${percentage}%)`}
						labelLine={false}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
				</PieChart>
			</ResponsiveContainer>
			<div className='mt-10 grid grid-cols-2 gap-3'>
				{chartData.map((item) => (
					<div key={item.name} className='flex items-center gap-2'>
						<div
							className='w-4 h-4 rounded'
							style={{ backgroundColor: COLORS[item.name] }}
						/>
						<div className='flex-1'>
							<p className='text-gray-700 dark:text-gray-300 text-sm'>
								{item.name}
							</p>
							<p className='text-gray-500 dark:text-gray-400 text-xs'>
								{item.value} quốc gia ({item.percentage}%)
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ContinentChart;
