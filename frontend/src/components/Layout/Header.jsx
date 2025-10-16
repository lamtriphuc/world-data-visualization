import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';

const Header = () => {
	return (
		<header className='flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow'>
			<h1 className='text-xl font-semibold'>Where in the world?</h1>
			<div className='flex items-center gap-3'>
				<SearchBar />
				<ThemeToggle />
			</div>
		</header>
	);
};

export default Header;
