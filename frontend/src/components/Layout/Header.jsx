import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { MdDashboard, MdOutlineTravelExplore } from 'react-icons/md';
import { LuGitCompare } from 'react-icons/lu';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import UserMenu from '../UserMenu';

const Header = () => {
	const { t } = useTranslation();
	const [user, setUser] = useState(null);

	useEffect(() => {
		const loadUser = () => {
			const avatar = localStorage.getItem('avatar');
			const name = localStorage.getItem('name');
			if (avatar && name) setUser({ avatar, name });
			else setUser(null);
		};

		loadUser(); // chạy lần đầu

		// Lắng nghe khi user thay đổi
		window.addEventListener('userChanged', loadUser);

		return () => window.removeEventListener('userChanged', loadUser);
	}, []);

	return (
		<header className='flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow sticky top-0 z-10 w-full lg:px-28 lg:py-6'>
			<Link to='/'>
				<h1 className='text-xl font-semibold'>Where in the world?</h1>
			</Link>
			<div className='flex items-center gap-5'>
				<div className='flex px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 items-center justify-center gap-2 '>
					<MdOutlineTravelExplore />
					<Link to='/countries'>{t('explore')}</Link>
				</div>
				<div className='flex px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 items-center justify-center gap-2 '>
					<LuGitCompare />
					<Link to='/comparison'>{t('comparison')}</Link>
				</div>
				<LanguageSwitcher />
				<ThemeToggle />
				<div className='flex px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 items-center justify-center gap-2 '>
					{/* {!user ? (
						<Link to='/login'>{t('login')}</Link>
					) : (
						<div className='w-12 h-12 cursor-pointer'>
							<img
								src={user?.avatar}
								alt={user?.name}
								className='rounded-full object-cover'
								referrerPolicy="no-referrer"
							/>
						</div>
					)} */}
					<UserMenu />
				</div>
			</div>
		</header>
	);
};

export default Header;
