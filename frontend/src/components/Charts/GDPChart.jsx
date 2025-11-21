import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const GDPChart = ({ gdp, population }) => {
	const { t } = useTranslation();
	const gdpPerCapita = gdp && population ? gdp / population : 0;

	const data = [
		{
			name: t('gdp_per_capita'),
			value: Math.round(gdpPerCapita),
		},
	];

	const handleValue = (value) => {
		return value.toLocaleString() + '$';
	};

	return (
		<div className='w-full flex justify-center'>
			<BarChart width={350} height={300} data={data}>
				<CartesianGrid strokeDasharray='3 3' />
				<XAxis
					dataKey='name'
					tick={{
						fill: 'var(--axis-color)',
					}}
				/>
				<YAxis
					tick={{
						fill: 'var(--axis-color)',
					}}
				/>
				<Tooltip
					formatter={(v) => handleValue(v)}
					itemStyle={{ color: 'black' }}
					labelStyle={{ color: 'black' }}
				/>
				<Bar dataKey='value' fill='#8884d8' />
			</BarChart>
		</div>
	);
};

export default GDPChart;
