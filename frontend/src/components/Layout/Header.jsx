import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { MdDashboard } from 'react-icons/md';
import { LuGitCompare } from 'react-icons/lu';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header = () => {
	const { t } = useTranslation();

	return (
		<header className='flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow sticky top-0 z-10 w-full lg:px-28 lg:py-6'>
			<Link to='/'>
				<h1 className='text-xl font-semibold'>Where in the world?</h1>
			</Link>
			<div className='flex items-center gap-5'>
				<div className='flex px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 items-center justify-center gap-1 '>
					<MdDashboard />
					<Link to='/dashboard'>{t('dashboard')}</Link>
				</div>
				<div className='flex px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 items-center justify-center gap-1 '>
					<LuGitCompare />
					<Link to='/comparison'>{t('comparison')}</Link>
				</div>
				<LanguageSwitcher />
				<ThemeToggle />
			</div>
		</header>
	);
};

export default Header;
