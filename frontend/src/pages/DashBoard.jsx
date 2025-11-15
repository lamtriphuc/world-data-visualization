import { BiGlobe } from 'react-icons/bi';
import { FiMap } from 'react-icons/fi';
import { LuUsers } from 'react-icons/lu';
import StatCard from '../components/Cards/StatCard';
import ContinentChart from '../components/Charts/ContinentChart';
import TopCountriesTable from '../components/Tables/TopCountriesTable';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getAllCountries } from '../services/country.service';
import Loading from '../components/Layout/Loading';

const Dashboard = () => {
	const { t } = useTranslation();
	const [countries, setCountries] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const res = await getAllCountries({ limit: 0 });
				setCountries(res.data || []);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchCountries();
	}, []);
	const totalCountries = countries.length;
	const totalPopulation = countries.reduce(
		(sum, c) => sum + (c.population.value || 0),
		0
	);

	const continentMap = {};
	countries.forEach((country) => {
		const region = country.region || 'Unknown';
		if (!continentMap[region]) continentMap[region] = 0;
		continentMap[region]++;
	});

	// Biểu đồ
	const continentData = Object.entries(continentMap).map(([name, value]) => ({
		name,
		value,
		percentage: ((value / totalCountries) * 100).toFixed(1),
	}));

	// Top 10 dân số
	const topPopulation = [...countries]
		.sort((a, b) => b.population.value - a.population.value)
		.slice(0, 10);

	// Top 10 diện tích
	const topArea = [...countries].sort((a, b) => b.area - a.area).slice(0, 10);

	if (loading) return <Loading />;

	return (
		<>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{/* Total Countries Card */}
				<StatCard
					title={t('total_countries')}
					value={totalCountries}
					subtitle={t('countries')}
					icon={BiGlobe}
					bgColor={'bg-blue-100'}
					iconColor={'text-blue-600'}
				/>

				{/* Total Population Card */}
				<StatCard
					title={t('total_population')}
					value={totalPopulation}
					subtitle={t('people')}
					icon={LuUsers}
					bgColor={'bg-green-100'}
					iconColor={'text-green-600'}
				/>

				{/* Continents Card */}
				<StatCard
					title={t('continents')}
					value={continentData.length}
					subtitle={t('continent')}
					icon={FiMap}
					bgColor={'bg-purple-100'}
					iconColor={'text-purple-600'}
				/>
			</div>

			{/* Charts and Tables */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Continent Chart */}
				<ContinentChart chartData={continentData} />

				{/* Top Countries by Population */}
				<TopCountriesTable
					countries={topPopulation}
					title={t('top_10_population')}
					type={'population'}
				/>

				{/* Top Countries by Area */}
			</div>
			<div className='grid grid-cols-1'>
				<TopCountriesTable
					countries={topArea}
					title={t('top_10_area')}
					type='area'
				/>
			</div>
		</>
	);
};
export default Dashboard;
