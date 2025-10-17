import { Link } from 'react-router-dom';
import CountryCard from '../components/Cards/CountryCard';
import FilterDropdown from '../components/Layout/FilterDropdown';
import SearchBar from '../components/Layout/SearchBar';

const countries = [
	{
		name: 'Lithuania',
		population: '2.794.700',
		region: 'Europe',
		capital: 'Vilnius',
		image: 'https://flagcdn.com/lt.svg',
	},
	{
		name: 'Chile',
		population: '19.116.209',
		region: 'Americas',
		capital: 'Santiago',
		image: 'https://flagcdn.com/cl.svg',
	},
	{
		name: 'Benin',
		population: '12.123.198',
		region: 'Africa',
		capital: 'Porto-Novo',
		image: 'https://flagcdn.com/bj.svg',
	},
	{
		name: 'Falkland Islands',
		population: '2.563',
		region: 'South America',
		capital: 'Stanley',
		image: 'https://flagcdn.com/fk.svg',
	},
	{
		name: 'Georgia',
		population: '3.714.000',
		region: 'Asia',
		capital: 'Tbilisi',
		image: 'https://flagcdn.com/ge.svg',
	},
];

const CountryList = () => {
	return (
		<>
			<div className='flex flex-col items-start justify-between w-full md:flex-row md:items-center pb-8'>
				<SearchBar />
				<FilterDropdown />
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8'>
				{countries.map((country) => (
					<Link to='/country'>
						<CountryCard
							name={country.name}
							population={country.population}
							region={country.region}
							capital={country.capital}
							image={country.image}
						/>
					</Link>
				))}
			</div>
		</>
	);
};
export default CountryList;
