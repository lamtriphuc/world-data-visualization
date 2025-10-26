import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();
	const { t } = useTranslation();

	return (
		<button onClick={toggleTheme}>
			{theme === 'dark' ? (
				<div className='flex items-center px-2 py-1 rounded-lg  dark:bg-gray-800 dark:hover:bg-gray-700 justify-center gap-1'>
					<FiSun className='text-yellow-400' />
					<span>{t('light_mode')}</span>
				</div>
			) : (
				<div className='flex items-center px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 justify-center gap-1'>
					<FiMoon />
					<span>{t('dark_mode')}</span>
				</div>
			)}
		</button>
	);
};
export default ThemeToggle;
