import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<button onClick={toggleTheme}>
			{theme === 'dark' ? (
				<div className='flex items-center justify-center gap-1'>
					<FiSun className='text-yellow-400' />
					<span>Light Mode</span>
				</div>
			) : (
				<div className='flex items-center justify-center gap-1'>
					<FiMoon />
					<span>Dark Mode</span>
				</div>
			)}
		</button>
	);
};
export default ThemeToggle;
