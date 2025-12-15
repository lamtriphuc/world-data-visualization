import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import { MdOutlineTravelExplore } from 'react-icons/md';
import { LuGitCompare } from 'react-icons/lu';
import { HiSparkles } from 'react-icons/hi2';
import { IoClose } from 'react-icons/io5';
import { FiBarChart2 } from 'react-icons/fi';
import { FaMagnifyingGlass, FaTrophy } from 'react-icons/fa6';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from '../UserMenu';
import { smartSearch } from '../../services/smartSearch.service';

const SAMPLE_QUERIES = [
	{ en: 'G7 countries', vi: 'Các quốc gia G7' },
	{ en: 'Socialist countries', vi: 'Các quốc gia xã hội chủ nghĩa' },
	{ en: 'ASEAN members', vi: 'Các thành viên ASEAN' },
	{ en: 'Countries with monarchy', vi: 'Các quốc gia quân chủ' },
	{ en: 'Richest countries', vi: 'Các quốc gia giàu nhất' },
];

const Header = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);

	// Smart Search states
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const containerRef = useRef(null);
	const currentLang = i18n.language?.startsWith('vi') ? 'vi' : 'en';

	useEffect(() => {
		const loadUser = () => {
			const avatar = localStorage.getItem('avatar');
			const name = localStorage.getItem('name');
			if (avatar && name) setUser({ avatar, name });
			else setUser(null);
		};

		loadUser();
		window.addEventListener('userChanged', loadUser);
		return () => window.removeEventListener('userChanged', loadUser);
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSearch = async (searchQuery) => {
		const q = searchQuery || query;
		if (!q.trim()) return;

		setIsLoading(true);
		setShowDropdown(false);

		try {
			const result = await smartSearch(q.trim());
			// Navigate to countries page with search results
			navigate('/countries', {
				state: {
					smartSearchResults: result.countries,
					smartSearchInterpretation: result.interpretation,
					smartSearchTotal: result.total,
					smartSearchQuery: q.trim(),
				},
			});
			setQuery('');
		} catch (err) {
			console.error('Smart search error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const handleSuggestionClick = (suggestion) => {
		const queryText = currentLang === 'vi' ? suggestion.vi : suggestion.en;
		setQuery(queryText);
		handleSearch(queryText);
	};

	return (
		<header className='flex flex-col lg:flex-row justify-between items-center gap-4 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow sticky top-0 z-10 w-full lg:px-28 lg:py-4'>
			<Link to='/'>
				<h1 className='text-xl font-semibold whitespace-nowrap'>
					Where in the world?
				</h1>
			</Link>

			{/* Smart Search Bar */}
			<div className='relative w-full lg:max-w-md' ref={containerRef}>
				<div className='relative'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<HiSparkles
							className={`w-4 h-4 ${
								isLoading ? 'text-indigo-500 animate-pulse' : 'text-indigo-400'
							}`}
						/>
					</div>
					<input
						type='text'
						className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-9 pr-16 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
						placeholder={
							t('smart_search_placeholder') || 'Ask anything about countries...'
						}
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setShowDropdown(true);
						}}
						onFocus={() => setShowDropdown(true)}
						onKeyDown={handleKeyDown}
						disabled={isLoading}
					/>
					<div className='absolute inset-y-0 right-0 flex items-center pr-1.5 gap-1'>
						{query && (
							<button
								onClick={() => setQuery('')}
								className='p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
								<IoClose className='w-3.5 h-3.5' />
							</button>
						)}
						<button
							onClick={() => handleSearch()}
							disabled={isLoading || !query.trim()}
							className='px-2 py-1 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isLoading ? '...' : <FaMagnifyingGlass className='w-3 h-3' />}
						</button>
					</div>
				</div>

				{/* Suggestions Dropdown */}
				{showDropdown && !isLoading && (
					<div className='absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
						<div className='px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50'>
							{t('sample_queries') || 'Try these queries'}
						</div>
						<ul className='max-h-48 overflow-auto'>
							{SAMPLE_QUERIES.map((suggestion, index) => (
								<li
									key={index}
									className='px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2'
									onClick={() => handleSuggestionClick(suggestion)}>
									<HiSparkles className='w-3.5 h-3.5 text-indigo-400' />
									<span>
										{currentLang === 'vi' ? suggestion.vi : suggestion.en}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Navigation */}
			<div className='flex items-center gap-4'>
				<Link
					to='/countries'
					className='flex px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 items-center gap-2 text-sm'>
					<MdOutlineTravelExplore />
					<span className='hidden sm:inline'>{t('explore')}</span>
				</Link>
				<Link
					to='/comparison'
					className='flex px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 items-center gap-2 text-sm'>
					<LuGitCompare />
					<span className='hidden sm:inline'>{t('comparison')}</span>
				</Link>
				<Link
					to='/ml-analysis'
					className='flex px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 items-center gap-2 text-sm'
					title='ML Analysis'>
					<FiBarChart2 />
					<span className='hidden sm:inline'>ML</span>
				</Link>
				<Link
					to='/rankings'
					className='flex px-2 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 items-center gap-2 text-sm'
					title='Rankings'>
					<FaTrophy />
					<span className='hidden sm:inline'>Xếp hạng</span>
				</Link>
				<LanguageSwitcher />
				<ThemeToggle />
				<UserMenu />
			</div>
		</header>
	);
};

export default Header;
