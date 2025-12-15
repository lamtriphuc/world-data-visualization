import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import translated from '../../scripts/countries_translated.json';

const CountrySearch = ({ countries, onSelect }) => {
	const [query, setQuery] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);

	// 1. KHÔI PHỤC STATE NÀY: Để ghi nhớ quốc gia đang chọn
	const [selectedCountry, setSelectedCountry] = useState(null);

	const { t, i18n } = useTranslation();
	// 2. SỬA LOGIC CHECK NGÔN NGỮ: Dùng startsWith để an toàn hơn (vi, vi-VN đều nhận)
	const currentLang = i18n.language || 'en';
	const isVietnamese = currentLang.startsWith('vi');

	const inputRef = useRef();

	const searchableCountries = useMemo(() => {
		return countries.map((c) => {
			const found = translated.find(
				(t) => t.name.toLowerCase() === c.name.toLowerCase()
			);

			return {
				...c,
				name_en: c.name,
				name_vi: found?.name_vi || c.name, // fallback tiếng Anh nếu thiếu
				searchString: `${c.name} ${found?.name_vi || ''}`.toLowerCase(),
			};
		});
	}, [countries]);

	const filteredCountries = useMemo(() => {
		if (!query) return searchableCountries.slice(0, 100);
		const lowerQuery = query.toLowerCase();
		return searchableCountries
			.filter((c) => c.searchString.includes(lowerQuery))
			.slice(0, 100);
	}, [query, searchableCountries]);

	// 3. THÊM USE EFFECT: Tự động đổi tên trong ô input khi ngôn ngữ thay đổi
	useEffect(() => {
		if (selectedCountry) {
			// Nếu đang chọn 1 nước, hiển thị tên theo ngôn ngữ hiện tại
			const newName = isVietnamese
				? selectedCountry.name_vi
				: selectedCountry.name_en;
			if (query !== newName) {
				setQuery(newName);
			}
		}
	}, [currentLang, selectedCountry]); // Chạy khi đổi ngôn ngữ hoặc chọn nước mới

	const handleSelect = (country) => {
		setSelectedCountry(country); // Lưu lại nước đã chọn

		const displayName = isVietnamese ? country.name_vi : country.name_en;
		setQuery(displayName);
		setShowDropdown(false);
		onSelect(country);
	};

	// Xử lý khi gõ tay: Reset lựa chọn cũ để tránh nhầm lẫn
	const handleInputChange = (e) => {
		setQuery(e.target.value);
		setShowDropdown(true);
		// Nếu người dùng sửa text, coi như bỏ chọn nước cũ
		if (selectedCountry) setSelectedCountry(null);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (inputRef.current && !inputRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className='relative w-full' ref={inputRef}>
			<input
				type='text'
				className='w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-4 pr-10 shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-white'
				placeholder={t('search_placeholder')}
				value={query}
				onChange={handleInputChange} // Dùng hàm handler mới
				onFocus={() => setShowDropdown(true)}
			/>
			{showDropdown && filteredCountries.length > 0 && (
				<ul className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm dark:bg-gray-800'>
					{filteredCountries.map((country) => {
						// Logic hiển thị tên
						const displayName = isVietnamese
							? country.name_vi
							: country.name_en;
						const subName = isVietnamese ? country.name_en : country.name_vi;

						return (
							<li
								key={country.cca3}
								className='cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white dark:text-gray-300 dark:hover:text-white group'
								onClick={() => handleSelect(country)}>
								<div className='flex items-center gap-2'>
									{/* Flag nhỏ */}
									<img
										src={country.flag}
										alt={displayName}
										className='w-5 object-cover'
									/>

									{/* Tên */}
									<div className='flex flex-col'>
										<span className='font-medium'>{displayName}</span>
										{subName !== displayName && (
											<span className='text-xs text-gray-500 group-hover:text-gray-200'>
												{subName}
											</span>
										)}
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default CountrySearch;
