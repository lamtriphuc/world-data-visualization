import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();

	// Lấy ngôn ngữ hiện tại
	const currentLang = i18n.language || 'en';

	// Đổi ngôn ngữ khi click
	const toggleLanguage = () => {
		const nextLang = currentLang === 'en' ? 'vi' : 'en';
		i18n.changeLanguage(nextLang);
	};

	return (
		<button
			onClick={toggleLanguage}
			className='flex items-center gap-2 px-2 py-1 rounded-lg
			bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-medium'>
			<FiGlobe className='text-lg' />
			<span>{currentLang === 'en' ? 'English' : 'Tiếng Việt'}</span>
		</button>
	);
};

export default LanguageSwitcher;
