import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	ZAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useMemo } from 'react';
import { getTranslatedName } from '../../ultils';

const BubbleScatterChart = ({
	countries = [],
	regionColors = {},
	selectedRegion = null,
	isCompactMode = false,
}) => {
	const { t } = useTranslation();
	const currentLang = localStorage.getItem('lang');
	const [allChartData, setAllChartData] = useState([]);

	// Detect dark mode
	const [isDarkMode, setIsDarkMode] = useState(false);
	useEffect(() => {
		const checkDarkMode = () => {
			setIsDarkMode(document.documentElement.classList.contains('dark'));
		};
		checkDarkMode();
		// Listen for class changes on html element
		const observer = new MutationObserver(checkDarkMode);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		return () => observer.disconnect();
	}, []);

	// Xử lý dữ liệu: tính mật độ và format cho Recharts
	useEffect(() => {
		if (!countries || countries.length === 0) {
			setAllChartData([]);
			return;
		}

		const processed = countries
			.map((country) => {
				const population = country.population?.value || 0;
				const area = country.area || 0;
				const density = area && area > 0 ? population / area : 0;

				// Tính radius bubble
				const k = 3;
				let radius = Math.cbrt(Math.max(density, 1)) * k;
				radius = Math.min(Math.max(radius, 3), 15);

				return {
					name:
						currentLang === 'vi'
							? getTranslatedName(country.name)
							: country.name,
					originalName: country.name,
					area: area,
					population: population,
					density: density,
					radius: radius,
					region: country.region || 'Unknown',
					cca3: country.cca3,
					flag: country.flag,
					// Lưu màu trực tiếp vào data point
					color: regionColors[country.region] || regionColors.Default || '#999',
				};
			})
			.filter((d) => d.area > 0 && d.population > 0);

		// Lọc theo region AFTER calculating, không DURING
		const filtered = processed.filter((country) => {
			if (selectedRegion && selectedRegion !== 'All') {
				return country.region === selectedRegion;
			}
			return true;
		});
		setAllChartData(filtered);
	}, [countries, selectedRegion, currentLang, regionColors]);

	const formatNumber = (value, type = 'population') => {
		if (type === 'population') {
			if (value >= 1_000_000_000)
				return (value / 1_000_000_000).toFixed(2) + 'B';
			if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
			if (value >= 1_000) return (value / 1_000).toFixed(0) + 'k';
			return value.toFixed(0);
		} else if (type === 'area') {
			if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
			if (value >= 1_000) return (value / 1_000).toFixed(0) + 'k';
			return value.toFixed(0);
		}
		return value;
	};

	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className='bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600'>
					<p className='font-semibold text-gray-900 dark:text-white'>
						{data.name}
					</p>
					<p className='text-sm text-gray-700 dark:text-gray-300'>
						{t('region')}: <span className='font-medium'>{data.region}</span>
					</p>
					<p className='text-sm text-gray-700 dark:text-gray-300'>
						{t('area')}:{' '}
						<span className='font-medium'>
							{data.area.toLocaleString()} km²
						</span>
					</p>
					<p className='text-sm text-gray-700 dark:text-gray-300'>
						{t('population')}:{' '}
						<span className='font-medium'>
							{data.population.toLocaleString()}
						</span>
					</p>
					<p className='text-sm text-gray-700 dark:text-gray-300'>
						{t('density')}:{' '}
						<span className='font-medium'>{data.density.toFixed(1)} /km²</span>
					</p>
				</div>
			);
		}
		return null;
	};

	// Đếm số lượng theo region cho legend
	const regionCounts = useMemo(() => {
		const counts = {};
		allChartData.forEach((item) => {
			counts[item.region] = (counts[item.region] || 0) + 1;
		});
		return counts;
	}, [allChartData]);

	// Tính domain rõ ràng từ toàn bộ dữ liệu
	const areaDomain = useMemo(() => {
		if (allChartData.length === 0) return [1, 100];
		const areas = allChartData.map((d) => d.area).filter((a) => a > 0);
		const minArea = Math.min(...areas);
		const maxArea = Math.max(...areas);
		return [Math.max(1, minArea * 0.5), maxArea * 2];
	}, [allChartData]);

	const populationDomain = useMemo(() => {
		if (allChartData.length === 0) return [1, 100];
		const populations = allChartData
			.map((d) => d.population)
			.filter((p) => p > 0);
		const minPop = Math.min(...populations);
		const maxPop = Math.max(...populations);
		return [Math.max(1, minPop * 0.5), maxPop * 2];
	}, [allChartData]);

	if (allChartData.length === 0) {
		return (
			<div className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow'>
				<p className='text-gray-500 dark:text-gray-400 text-center py-8'>
					{t('no_data') || 'No data available'} (Countries:{' '}
					{countries?.length || 0})
				</p>
			</div>
		);
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg'>
			<div className='mb-4'>
				<h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
					{t('bubble_chart_title') || 'Population vs Area Scatter Plot'}
				</h2>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					{t('bubble_chart_description') ||
						'Bubble size represents population density. Color represents region.'}
				</p>
			</div>

			<ResponsiveContainer width='100%' height={isCompactMode ? 400 : 500}>
				<ScatterChart
					margin={{
						top: 20,
						right: 20,
						bottom: isCompactMode ? 20 : 60,
						left: 80,
					}}>
					<CartesianGrid
						strokeDasharray='3 3'
						stroke={isDarkMode ? '#374151' : '#e5e7eb'}
					/>

					<XAxis
						dataKey='area'
						name={t('area') || 'Area'}
						type='number'
						scale='log'
						domain={areaDomain}
						allowDataOverflow={false}
						tick={{ fill: isDarkMode ? '#9CA3AF' : '#666', fontSize: 12 }}
						label={{
							value: `${t('area') || 'Area'} (km²)`,
							position: 'insideBottomRight',
							offset: -5,
							fill: isDarkMode ? '#D1D5DB' : '#333',
						}}
						tickFormatter={(value) => formatNumber(value, 'area')}
					/>
					<YAxis
						dataKey='population'
						name={t('population') || 'Population'}
						type='number'
						scale='log'
						domain={populationDomain}
						allowDataOverflow={false}
						tick={{ fill: isDarkMode ? '#9CA3AF' : '#666', fontSize: 12 }}
						label={{
							value: `${t('population') || 'Population'}`,
							angle: -90,
							position: 'insideLeft',
							fill: isDarkMode ? '#D1D5DB' : '#333',
							dx: -20,
						}}
						tickFormatter={(value) => formatNumber(value, 'population')}
					/>
					<ZAxis dataKey='radius' range={[30, 400]} />
					<Tooltip
						cursor={{ strokeDasharray: '3 3' }}
						content={<CustomTooltip />}
					/>

					{/* Sử dụng MỘT Scatter duy nhất với Cell để set màu */}
					<Scatter
						name='Countries'
						data={allChartData}
						shape={(props) => {
							const { cx, cy, payload } = props;
							const radius = payload?.radius || 5;
							return (
								<circle
									cx={cx}
									cy={cy}
									r={radius}
									fill={payload?.color || '#999'}
									fillOpacity={0.7}
									stroke='#fff'
									strokeWidth={1}
								/>
							);
						}}>
						{allChartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Scatter>
				</ScatterChart>
			</ResponsiveContainer>

			{/* Legend */}
			<div className='mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
				{Object.entries(regionColors)
					.filter(([key]) => key !== 'Default')
					.map(([region, color]) => {
						const count = regionCounts[region] || 0;
						if (count === 0) return null;
						return (
							<div key={region} className='flex items-center gap-2'>
								<div
									className='w-4 h-4 rounded-full'
									style={{ backgroundColor: color }}
								/>
								<span className='text-sm text-gray-700 dark:text-gray-300'>
									{region} ({count})
								</span>
							</div>
						);
					})}
			</div>

			{/* Info */}
			<div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
				<p className='text-xs text-gray-700 dark:text-gray-300'>
					<span className='font-semibold'>{t('note') || 'Note'}:</span>{' '}
					{t('bubble_chart_note') ||
						'X-axis and Y-axis use logarithmic scale. Bubble size represents population density (population/area).'}
				</p>
			</div>
		</div>
	);
};

export default BubbleScatterChart;
