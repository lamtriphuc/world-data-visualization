import { BiGlobe } from 'react-icons/bi';
import { FiMap } from 'react-icons/fi';
import { LuUsers } from 'react-icons/lu';
import StatCard from '../components/Cards/StatCard';
import ContinentChart from '../components/Charts/ContinentChart';
import TopCountriesTable from '../components/Tables/TopCountriesTable';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import {
	getAllCountries,
	getAllCountryNames,
	getGlobalStats,
	getTop10Area,
	getTop10Population,
} from '../services/country.service';
import Loading from '../components/Layout/Loading';
import CountrySearch from '../components/Layout/CountrySearch';
import InteractiveMap from '../components/Map/InteractiveMap';
import RegionFilter from '../components/Layout/RegionFilter';
import { useNavigate } from 'react-router-dom';

const regionViewStates = {
	All: { center: [0, 20], zoom: 1 },
	Asia: { center: [90, 30], zoom: 2.5 },
	Europe: { center: [15, 50], zoom: 3 },
	Africa: { center: [20, 0], zoom: 2.5 },
	Americas: { center: [-90, 20], zoom: 2 },
	Oceania: { center: [135, -20], zoom: 3 },
	Antarctica: { center: [0, -85], zoom: 2 },
};

const regionColors = {
	Asia: '#E63946',
	Europe: '#457B9D',
	Africa: '#F4A261',
	Americas: '#2A9D8F',
	Oceania: '#A8DADC',
	Antarctica: '#10b981',
	Default: '#F1FAEE',
};

const Dashboard = () => {
	const { t } = useTranslation();
	const [countries, setCountries] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// map state
	const mapRef = useRef();
	const [geoData, setGeoData] = useState(null);
	const [allCountryNames, setAllCountryNames] = useState([]);
	const [regionFilter, setRegionFilter] = useState('All');
	const [selectedCountryCode, setSelectedCountryCode] = useState(null);
	const [topListType, setTopListType] = useState('population');
	const [topPopulation, setTopPopulaiton] = useState([]);
	const [topArea, setTopArea] = useState([]);
	const [stats, setStats] = useState();

	useEffect(() => {
		// Tải GeoJSON cho hình dạng bản đồ
		fetch('/countries.geojson')
			.then((resp) => resp.json())
			.then((json) => setGeoData(json))
			.catch((err) => console.error('Could not load geojson:', err));

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

		const fetchAllCountryNames = async () => {
			try {
				const res = await getAllCountryNames();
				setAllCountryNames(res);
			} catch (error) {
				console.log('fetchAllCountryNames ', error);
			}
		};

		const fetchTop10Area = async () => {
			try {
				const res = await getTop10Area();
				setTopArea(res);
			} catch (error) {
				console.log('fetch top 10 area ', error);
			}
		};

		const fetchTop10Population = async () => {
			try {
				const res = await getTop10Population();
				setTopPopulaiton(res);
			} catch (error) {
				console.log('fetch top 10 populaiton ', error);
			}
		};

		const fetchStats = async () => {
			try {
				const res = await getGlobalStats();
				setStats(res);
			} catch (error) {
				console.log('fetch stats', error);
			}
		};

		fetchStats();
		fetchTop10Area();
		fetchTop10Population();
		fetchCountries();
		fetchAllCountryNames();
	}, []);

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
		percentage: ((value / stats.totalCountries) * 100).toFixed(1),
	}));

	// Khi chọn từ thanh Search
	const handleSearchSelect = (country) => {
		if (country && mapRef.current) {
			setSelectedCountryCode(country.cca3);
			setRegionFilter('All');

			// Gọi hàm 'flyTo' của component con
			mapRef.current.flyTo(
				[country.latlng.lng, country.latlng.lat], // [Lng, Lat]
				4 // Zoom
			);
		}
	};

	// Khi click vào một nước trên bản đồ (được gọi từ InteractiveMap)
	const handleCountryClick = (countryCode) => {
		if (countryCode) {
			navigate(`/country/${countryCode}`);
		}
	};

	// Khi chọn từ bộ lọc Châu lục
	const handleRegionChange = (region) => {
		setRegionFilter(region);
		setSelectedCountryCode(null); // Tắt bộ lọc quốc gia

		// Lấy tọa độ/zoom từ object 'regionViewStates'
		const view = regionViewStates[region] || regionViewStates['All'];
		if (mapRef.current) {
			mapRef.current.flyTo(view.center, view.zoom);
		}
	};

	if (loading) return <Loading />;

	return (
		<>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{/* Total Countries Card */}
				<StatCard
					onClick={() => navigate('/countries')}
					title={t('total_countries')}
					value={stats.totalCountries}
					subtitle={t('countries')}
					icon={BiGlobe}
					bgColor={'bg-blue-100'}
					iconColor={'text-blue-600'}
				/>

				{/* Total Population Card */}
				<StatCard
					title={t('total_population')}
					value={stats.totalPopulation}
					subtitle={t('people')}
					icon={LuUsers}
					bgColor={'bg-green-100'}
					iconColor={'text-green-600'}
				/>

				{/* Continents Card */}
				<StatCard
					title={t('continents')}
					value={stats.totalRegions}
					subtitle={t('continent')}
					icon={FiMap}
					bgColor={'bg-purple-100'}
					iconColor={'text-purple-600'}
				/>
			</div>

			<div className='relative w-full h-[400px] mt-4'>
				{/* === Thanh Header chứa Tìm kiếm và Lọc === */}
				<div className='absolute top-0 left-0 right-0 z-2 p-4 flex flex-col md:flex-row gap-4'>
					<CountrySearch
						countries={allCountryNames}
						onSelect={handleSearchSelect}
					/>
					<RegionFilter
						regions={Object.keys(regionColors).filter((r) => r !== 'Default')}
						selectedRegion={regionFilter}
						onFilterChange={handleRegionChange}
					/>
				</div>

				{/* Map */}
				<div className='w-full h-full'>
					<InteractiveMap
						ref={mapRef}
						geoData={geoData}
						regionColors={regionColors}
						regionFilter={regionFilter}
						selectedCountryCode={selectedCountryCode}
						onCountryClick={handleCountryClick}
					/>
				</div>
			</div>

			{/* Charts and Tables */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Continent Chart */}
				<ContinentChart chartData={continentData} />

				<div>
					{/* Bảng TopCountriesTable */}
					<TopCountriesTable
						// Dữ liệu và loại (type) vẫn được truyền động
						countries={topListType === 'population' ? topPopulation : topArea}
						type={topListType}
						// Truyền state và hàm handler xuống cho ComboBox nội bộ
						topListType={topListType}
						onTopListTypeChange={setTopListType}
					/>
				</div>
			</div>
		</>
	);
};
export default Dashboard;
