import { BiGlobe } from "react-icons/bi";
import { FiMap } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import StatCard from "../components/Cards/StatCard";
import ContinentChart from "../components/Charts/ContinentChart";
import TopCountriesTable from "../components/Tables/TopCountriesTable";

const Dashboard = () => {
	const data = [
		{ name: "Africa", value: 48, percentage: 23 },
		{ name: "Americas", value: 44, percentage: 33 },
		{ name: "Asia", value: 54, percentage: 65 },
		{ name: "Europe", value: 23, percentage: 40 },
		{ name: "Oceania", value: 12, percentage: 21 },
		{ name: "Antarctic", value: 14, percentage: 53 },
	];

	const countries = [
		{
			cca3: "USA",
			name: { common: "United States" },
			region: "Americas",
			population: 339996563,
			area: 9833520,
			flags: { svg: "https://flagcdn.com/us.svg" }
		},
		{
			cca3: "CHN",
			name: { common: "China" },
			region: "Asia",
			population: 1411750000,
			area: 9596961,
			flags: { svg: "https://flagcdn.com/cn.svg" }
		},
		{
			cca3: "IND",
			name: { common: "India" },
			region: "Asia",
			population: 1407563842,
			area: 3287263,
			flags: { svg: "https://flagcdn.com/in.svg" }
		},
		{
			cca3: "RUS",
			name: { common: "Russia" },
			region: "Europe",
			population: 146270000,
			area: 17098242,
			flags: { svg: "https://flagcdn.com/ru.svg" }
		},
		{
			cca3: "BRA",
			name: { common: "Brazil" },
			region: "Americas",
			population: 216422000,
			area: 8515767,
			flags: { svg: "https://flagcdn.com/br.svg" }
		},
		{
			cca3: "AUS",
			name: { common: "Australia" },
			region: "Oceania",
			population: 26442000,
			area: 7692024,
			flags: { svg: "https://flagcdn.com/au.svg" }
		},
		{
			cca3: "CAN",
			name: { common: "Canada" },
			region: "Americas",
			population: 38929000,
			area: 9984670,
			flags: { svg: "https://flagcdn.com/ca.svg" }
		},
		{
			cca3: "FRA",
			name: { common: "France" },
			region: "Europe",
			population: 68042500,
			area: 551695,
			flags: { svg: "https://flagcdn.com/fr.svg" }
		},
		{
			cca3: "DEU",
			name: { common: "Germany" },
			region: "Europe",
			population: 84687000,
			area: 357114,
			flags: { svg: "https://flagcdn.com/de.svg" }
		},
		{
			cca3: "JPN",
			name: { common: "Japan" },
			region: "Asia",
			population: 124120000,
			area: 377975,
			flags: { svg: "https://flagcdn.com/jp.svg" }
		}
	];


	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Total Countries Card */}
				<StatCard
					title={'Tổng số quốc gia'}
					value={250}
					subtitle={'quốc gia'}
					icon={BiGlobe}
					bgColor={'bg-blue-100'}
					iconColor={'text-blue-600'}
				/>

				{/* Total Population Card */}
				<StatCard
					title={'Tổng Dân Số Thế Giới'}
					value={88434374374}
					subtitle={'người'}
					icon={LuUsers}
					bgColor={'bg-green-100'}
					iconColor={'text-green-600'}
				/>

				{/* Continents Card */}
				<StatCard
					title={'Châu Lục'}
					value={6}
					subtitle={'châu lục'}
					icon={FiMap}
					bgColor={'bg-purple-100'}
					iconColor={'text-purple-600'}
				/>
			</div>

			{/* Charts and Tables */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Continent Chart */}
				<ContinentChart chartData={data} />

				{/* Top Countries by Population */}
				<TopCountriesTable
					countries={countries}
					title={'Top 10 Quốc Gia Có Dân Số Lớn Nhất'}
					type={'population'}
				/>

				{/* Top Countries by Area */}

			</div>
			<div className="grid grid-cols-1">
				<TopCountriesTable
					countries={countries}
					title="Top 10 Quốc Gia Có Diện Tích Lớn Nhất"
					type="area"
				/>
			</div>
		</>
	)
};
export default Dashboard;
