import { useTranslation } from 'react-i18next';
import {
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
import translated from '../../scripts/countries_translated.json';

const CompareChart = ({ countries, gdp }) => {
	const { t } = useTranslation();
	const currentLang = localStorage.getItem('lang');

	const getTranslatedName = (name) => {
		const found = translated.find((c) => c.name === name);
		return found?.name_vi || name;
	};

	const basicData = countries.map((country) => ({
		name: currentLang === 'vi' ? getTranslatedName(country.name) : country.name,
		population: country.population,
		area: country.area,
	}));

	// Transform GDP data into the format needed for the chart
	// Tìm tất cả các năm từ tất cả các quốc gia để đảm bảo có dữ liệu đầy đủ
	const allYears = new Set();
	gdp.forEach((countryGdp) => {
		if (countryGdp?.data && Array.isArray(countryGdp.data)) {
			countryGdp.data.forEach((item) => {
				allYears.add(item.year);
			});
		}
	});

	const gdpData = Array.from(allYears)
		.sort()
		.map((year) => {
			const transformed = { year };
			gdp.forEach((countryGdp) => {
				if (!countryGdp?.cca3 || !countryGdp?.data) return;
				const matchingYear = countryGdp.data.find((d) => d.year === year);
				if (matchingYear) {
					transformed[countryGdp.cca3] = matchingYear.value;
				}
			});
			return transformed;
		});

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
					{gdp
						.filter(
							(countryGdp) =>
								countryGdp &&
								countryGdp.cca3 &&
								Array.isArray(countryGdp.data) &&
								countryGdp.data.length > 0
						)
						.map((countryGdp, index) => {
							const country = countries.find((c) => c.cca3 === countryGdp.cca3);
							return (
								<Line
									key={countryGdp.cca3}
									type='monotone'
									dataKey={countryGdp.cca3}
									stroke={['#60a5fa', '#34d399', '#f472b6'][index]}
									strokeWidth={2}
									name={
										currentLang === 'vi'
											? getTranslatedName(country?.name)
											: country?.name || countryGdp.cca3
									}
								/>
							);
						})}
				</LineChart>
			</div>
		</div>
	);
};
export default CompareChart;
