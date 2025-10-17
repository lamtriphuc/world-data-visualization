import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { MdDashboard } from 'react-icons/md';
import { MdOutlineLightMode } from 'react-icons/md';
import { LuGitCompare } from 'react-icons/lu';
import Comparison from '../../pages/Comparison';

const Header = () => {
	return (
		<header className='flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow sticky top-0 z-10 w-full lg:px-28 lg:py-6'>
			<Link to='/'>
				<h1 className='text-xl font-semibold'>Where in the world?</h1>
			</Link>
			<div className='flex items-center gap-5'>
				<div className='flex items-center justify-center gap-1 '>
					<MdDashboard />
					<Link to='/dashboard'>Dashboard</Link>
				</div>
				<div className='flex items-center justify-center gap-1 '>
					<LuGitCompare />
					<Link to='/comparison'>Comparison</Link>
				</div>
				<ThemeToggle />
			</div>
		</header>
	);
};

export default Header;
