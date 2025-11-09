import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	LineChart,
	Line,
	ResponsiveContainer,
	ComposedChart,
} from 'recharts';

const CompareChart = ({ countries, gdp }) => {
	const { t } = useTranslation();

	const basicData = countries.map((country) => ({
		name: country.name,
		population: country.population,
		area: country.area,
	}));

	// Transform GDP data into the format needed for the chart
	const gdpData =
		gdp[0]?.data.map((yearItem) => {
			const transformed = { year: yearItem.year };
			gdp.forEach((countryGdp) => {
				const matchingYear = countryGdp.data.find(
					(d) => d.year === yearItem.year
				);
				if (matchingYear) {
					transformed[countryGdp.cca3] = matchingYear.value;
				}
			});
			return transformed;
		}) || [];

	return (
		<div className='p-6 space-y-12 max-w-5xl mx-auto'>
			{/* --- Biểu đồ dân số & diện tích --- */}
			<div className='mt-10'>
				<h2 className='text-lg font-medium text-gray-700 dark:text-gray-300 mb-3'>
					{t('population_area')}
				</h2>

				<ResponsiveContainer width='100%' height={500}>
					<ComposedChart
						data={basicData}
						margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis
							dataKey='name'
							tick={{
								fill: 'var(--axis-color)',
							}}
						/>
						<YAxis
							yAxisId='left'
							orientation='left'
							tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
							tick={{
								fill: 'var(--axis-color)',
							}}
						/>
						<YAxis
							yAxisId='right'
							orientation='right'
							tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
							tick={{
								fill: 'var(--axis-color)',
							}}
						/>
						<Tooltip
							labelClassName='text-gray-800'
							formatter={(v) => v.toLocaleString()}
							labelFormatter={(label) => `Quốc gia: ${label}`}
						/>
						<Legend />

						{/* Dân số = cột */}
						<Bar
							yAxisId='left'
							dataKey='population'
							fill='#60a5fa'
							name={t('population')}
							barSize={50}
						/>

						{/* Diện tích = đường */}
						<Line
							yAxisId='right'
							type='monotone'
							dataKey='area'
							stroke='#34d399'
							strokeWidth={3}
							name={`${t('area')} (km²)`}
							dot={{ r: 5 }}
						/>
					</ComposedChart>
				</ResponsiveContainer>
			</div>

			{/* --- Biểu đồ GDP 10 năm --- */}
			<div>
				<h2 className='text-lg font-medium text-gray-700 dark:text-gray-300 mb-3'>
					{t('gdp_10_years')}
				</h2>
				<LineChart
					width={1000}
					height={500}
					data={gdpData}
					margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis
						dataKey='year'
						tick={{
							fill: 'var(--axis-color)',
						}}
					/>
					<YAxis
						tick={{
							fill: 'var(--axis-color)',
						}}
						tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(0)}B`}
					/>
					<Tooltip
						formatter={(v) => v.toLocaleString()}
						labelClassName='text-gray-800'
					/>
					<Legend />
					{gdp.map((countryGdp, index) => (
						<Line
							key={countryGdp.cca3}
							type='monotone'
							dataKey={countryGdp.cca3}
							stroke={['#60a5fa', '#34d399', '#f472b6'][index]}
							strokeWidth={2}
							name={
								countries.find((c) => c.cca3 === countryGdp.cca3)?.name ||
								countryGdp.cca3
							}
						/>
					))}
				</LineChart>
			</div>
		</div>
	);
};
export default CompareChart;
