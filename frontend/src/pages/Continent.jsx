import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdArrowBack } from 'react-icons/io';
import Dropdown from '../components/Layout/Dropdown';
import { LuChartArea, LuUsers } from 'react-icons/lu';
import StatCard from '../components/Cards/StatCard';
import BarChartComponent from '../components/Charts/BarChart';
import PieChartComponent from '../components/Charts/PieChart';
import {
	getAllCountriesContinent,
	getMax,
	getStats,
	getTop10Area,
	getTop10Population,
	getTopLanguages,
} from '../services/country.service';
import CountryCardContinent from '../components/Cards/CountryCardContient';
import { useNavigate, useParams } from 'react-router-dom';
import { BiGlobe } from 'react-icons/bi';
import { getTranslatedName } from '../ultils';
import Loading from '../components/Layout/Loading';
import TopLanguagesTable from '../components/Tables/TopLanguagesTable';
import LanguageBarChart from '../components/Charts/LanguageBarChart';
import { translateCapital } from '../scripts/capital_names_vi';

const Continent = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const currentLang = localStorage.getItem('lang');
	// const [region, setRegion] = useState('Asia');
	const [countries, setCountries] = useState([]);
	const [stats, setStats] = useState();
	const [maxArea, setMaxArea] = useState();
	const [maxPopulation, setMaxPopulation] = useState();
	const [topPopulation, setTopPopulaiton] = useState([]);
	const [topArea, setTopArea] = useState([]);
	const [topLanguages, setTopLanguages] = useState([]);
	const [languageChartData, setLanguageChartData] = useState([]);
	const [territory, setTerritory] = useState([]);
	const [mode, setMode] = useState('population');
	const [loading, setLoading] = useState(true);

	const { region } = useParams();
	const curRegion = region || 'Asia';

	const regions = [
		{ label: t('main_region.Asia'), value: 'Asia' },
		{ label: t('main_region.Europe'), value: 'Europe' },
		{ label: t('main_region.Africa'), value: 'Africa' },
		{ label: t('main_region.Americas'), value: 'Americas' },
		{ label: t('main_region.Oceania'), value: 'Oceania' },
		{ label: t('main_region.Antarctic'), value: 'Antarctic' },
	];

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const res = await getAllCountriesContinent({
					region: curRegion,
					sortOrder: 1,
					limit: 150,
				});
				setCountries(res.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		const fetchTerritory = async () => {
			try {
				const res = await getAllCountriesContinent({
					region: curRegion,
					independent: false,
					sortOrder: 1,
					limit: 150,
				});
				setTerritory(res.data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		const fetchMax = async () => {
			try {
				const res = await getMax(curRegion);
				setMaxArea(res.maxArea);
				setMaxPopulation(res.maxPopulation);
			} catch (err) {
				console.error(err);
			}
		};

		const fetchStats = async () => {
			try {
				const res = await getStats(curRegion);
				setStats(res);
			} catch (err) {
				console.error(err);
			}
		};

		const fetchTopLanguages = async () => {
			try {
				const res = await getTopLanguages(curRegion);

				if (res && res.chartData) {
					const { labels, data } = res.chartData;

					// Map 2 mảng (labels, data) thành 1 mảng object [{name, value}] cho Recharts
					const formattedData = labels.map((label, index) => ({
						name: label, // VD: "Arabic"
						value: data[index], // VD: 13
					}));

					setLanguageChartData(formattedData);
				}

				setTopLanguages(res.raw);
			} catch (err) {
				console.error(err);
			}
		};

		const fetchTop10Area = async () => {
			try {
				const res = await getTop10Area(curRegion);
				const data = res.map((c) => ({
					name: c.name,
					value: c.area,
				}));
				setTopArea(data);
			} catch (error) {
				console.log('fetch top 10 area ', error);
			}
		};

		const fetchTop10Population = async () => {
			try {
				const res = await getTop10Population(curRegion);
				const data = res.map((c) => ({
					name: c.name,
					value: c.population.value,
				}));
				setTopPopulaiton(data);
			} catch (error) {
				console.log('fetch top 10 populaiton ', error);
			}
		};

		fetchTop10Area();
		fetchTop10Population();
		fetchTopLanguages();

		fetchMax();
		fetchCountries();
		fetchTerritory();
		fetchStats();
	}, [curRegion]);

	const chartData = mode === 'population' ? topPopulation : topArea;

	if (loading) return <Loading />;

	return (
		<div>
			<div className='flex justify-between'>
				<button
					onClick={() => navigate('/')}
					className='bg-white dark:bg-gray-800 px-3 py-1 rounded-md text-gray-700 dark:text-gray-300 flex items-center gap-3 cursor-pointer'>
					<IoMdArrowBack />
					{t('back')}
				</button>

				<Dropdown
					label={regions.find((r) => r.value === curRegion)?.label}
					items={regions.map((r) => ({
						label: r.label,
						value: r.value
					}))}
					onSelect={(value) => navigate(`/continent/${value}`)}
				/>
			</div>
			<div className='my-4 grid grid-cols-1 md:grid-cols-3 gap-6'>
				<StatCard
					title={t('total_country_continent')}
					value={stats?.countryCount}
					subtitle={t('countries')}
					icon={BiGlobe}
					bgColor={'bg-blue-100'}
					iconColor={'text-blue-600'}
				/>
				<StatCard
					title={t('total_population_continent')}
					value={stats?.totalPopulation}
					subtitle={t('people')}
					icon={LuUsers}
					bgColor={'bg-green-100'}
					iconColor={'text-green-600'}
				/>
				<StatCard
					title={t('total_area_continent')}
					value={stats?.totalArea}
					subtitle={'km²'}
					icon={LuChartArea}
					bgColor={'bg-purple-100'}
					iconColor={'text-purple-600'}
				/>
			</div>

			{curRegion !== 'Antarctic' && (
				<>
					{/* Chart */}
					<div>
						<div className='py-6 space-y-4'>
							<div className='flex justify-end'>
								<Dropdown
									label={mode === 'population' ? t('population') : t('area')}
									items={[
										{ label: t('population'), value: 'population' },
										{ label: t('area'), value: 'area' },
									]}
									onSelect={(value) => setMode(value)}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<BarChartComponent data={chartData} type={mode} />
								<PieChartComponent
									data={chartData}
									type={mode}
									total={
										mode === 'population'
											? stats?.totalPopulation
											: stats?.totalArea
									}
								/>
							</div>
						</div>
					</div>

					{/* Area */}
					<div className='grid grid-cols-2 gap-6'>
						<div
							onClick={() => navigate(`/country/${maxPopulation.cca3}`)}
							className='px-6 py-4 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer'>
							<p className='text-gray-700 dark:text-gray-300 mb-2'>
								{t('text_most_populous')}
							</p>
							<div className='flex'>
								<div className='w-25 text-7xl flex items-center justify-center mr-10'>
									{maxPopulation?.cca2}
								</div>
								<div className='flex flex-col'>
									<p className='text-gray-900 dark:text-white text-2xl font-medium'>
										{currentLang === 'vi'
											? getTranslatedName(maxPopulation?.name)
											: maxPopulation?.name}
									</p>
									<p className='text-gray-700 dark:text-gray-400 text-sm mt-1'>
										{' '}
										{t('population')}:{' '}
										{maxPopulation?.population.value.toLocaleString()}{' '}
									</p>
									<p className='text-gray-700 dark:text-gray-400 text-sm mt-1'>
										{' '}
										{t('area')}: {maxPopulation?.area.toLocaleString()}{' '}
									</p>
									<p className='text-gray-700 dark:text-gray-400 text-sm mt-1'>
										{' '}
										{t('capital')}: {maxPopulation?.capital[0]}{' '}
									</p>
								</div>
								<div className='w-35 p-3 rounded-lg ml-auto'>
									<img src={maxPopulation?.flag} alt={maxPopulation?.cca2} />
								</div>
							</div>
						</div>
						<div
							onClick={() => navigate(`/country/${maxArea.cca3}`)}
							className='px-6 py-4 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer'>
							<p className='text-gray-700 dark:text-gray-300 mb-2'>
								{t('text_largest_area')}
							</p>
							<div className='flex'>
								<div className='w-25 text-7xl flex items-center justify-center mr-10'>
									{maxArea?.cca2}
								</div>
								<div className='flex flex-col'>
									<p className='text-gray-900 dark:text-white text-2xl font-medium'>
										{currentLang === 'vi'
											? getTranslatedName(maxArea?.name)
											: maxArea?.name}
									</p>
									<p className='text-gray-700 dark:text-gray-400 text-sm mt-1'>
										{' '}
										{t('population')}:{' '}
										{maxArea?.population.value.toLocaleString()}{' '}
									</p>
									<p className='text-gray-700 dark:text-gray-400 text-sm mt-1'>
										{' '}
										{t('area')}: {maxArea?.area.toLocaleString()}{' '}
									</p>
									<p className='text-gray-700 dark:text-gray-400 text-sm mt-1'>
										{' '}
										{t('capital')}: {translateCapital(maxArea?.capital[0])}{' '}
									</p>
								</div>
								<div className='w-35 p-3 rounded-lg ml-auto'>
									<img src={maxArea?.flag} alt={maxArea?.cca2} />
								</div>
							</div>
						</div>
					</div>

					{/* Language */}
					<div className='mt-10  gap-6'>
						<LanguageBarChart data={languageChartData} />
					</div>
				</>
			)}

			<div className='py-6 w-full'>
				<h2 className='text-xl font-bold mb-4'>
					{t('all_countries')} ({countries.length})
				</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8'>
					{countries.map((country, index) => (
						<CountryCardContinent
							key={index}
							country={country}
							index={index}
							onClick={() => navigate(`/country/${country.cca3}`)}
						/>
					))}
				</div>
			</div>
			<div className='py-6 w-full'>
				<h2 className='text-xl font-bold mb-4'>
					{t('all_territory')} ({territory.length})
				</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8'>
					{territory.map((country, index) => (
						<CountryCardContinent
							key={index}
							country={country}
							index={index}
							onClick={() => navigate(`/country/${country.cca3}`)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default Continent;
