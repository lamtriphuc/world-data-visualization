import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	deleteTravelTracker,
	getTravelTracker,
	postTravelTracker,
} from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { getAllCountries } from '../services/country.service';
import { CgKey } from 'react-icons/cg';
import Loading from '../components/Layout/Loading';
import { BiHeart, BiHome, BiMapPin, BiSearch, BiX } from 'react-icons/bi';
import InteractiveMap from '../components/Map/InteractiveMap';
import { useTranslation } from 'react-i18next';
import { getTranslatedName, toInputDate } from '../ultils';
import { AITravelAdvisor } from '../components/AI';
import CountrySearch from '../components/Layout/CountrySearch';

const TRAVEL_COLORS = {
	visited: '#10B981', // Xanh lá - Đã đi
	bucket: '#F59E0B', // Vàng - Muốn đi
	living: '#3B82F6', // Xanh dương - Đang sống
	default: '#E5E7EB', // Xám - Chưa đánh dấu
};
const TravelTracker = () => {
	const navigate = useNavigate();
	const mapRef = useRef();
	const { t } = useTranslation();
	const lang = localStorage.getItem('lang');

	const [countries, setCountries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [geoData, setGeoData] = useState(null);
	const [countryStatus, setCountryStatus] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [stats, setStats] = useState({ visited: 0, bucket: 0, living: 0 });
	const [selectedCountryCode, setSelectedCountryCode] = useState(null);

	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [note, setNote] = useState('');

	const mapContainerRef = useRef(null);

	useEffect(() => {
		fetch('/countries.geojson')
			.then((resp) => resp.json())
			.then((json) => setGeoData(json))
			.catch((err) => console.error('Could not load geojson:', err));

		const fetchTravelTracker = async () => {
			try {
				const response = await getTravelTracker();
				setCountryStatus(response);
			} catch (error) {
				console.log('Travel tracker: ', error);
			}
		};

		const fetchAllCountries = async () => {
			try {
				const res = await getAllCountries({ limit: 0 });
				setCountries(res.data);
			} catch (error) {
				console.log('fetchAllCountries ', error);
			}
		};

		fetchAllCountries();
		fetchTravelTracker();
	}, []);

	useEffect(() => {
		const visited = countryStatus.filter((s) => s.status === 'visited').length;
		const bucket = countryStatus.filter((s) => s.status === 'bucket').length;
		const living = countryStatus.filter((s) => s.status === 'living').length;
		setStats({ visited, bucket, living });
	}, [countryStatus]);

	useEffect(() => {
		if (showModal && selectedCountry) {
			const found = countryStatus.find((x) => x.cca3 === selectedCountry.cca3);

			setStartDate(toInputDate(found?.startDate));
			setEndDate(toInputDate(found?.endDate));
			setNote(found?.note || '');
		}
	}, [showModal, selectedCountry]);

	const travelColors = useMemo(() => {
		const colors = {};

		countryStatus.forEach((item) => {
			if (item.status && TRAVEL_COLORS[item.status]) {
				colors[item.cca3] = TRAVEL_COLORS[item.status];
			}
		});

		return colors;
	}, [countryStatus]);

	const handleCountryClick = (cca3) => {
		const country = countries.find((c) => c.cca3 === cca3);
		if (!country) {
			console.log('Country not found:', cca3);
			return;
		}

		const statusItem = countryStatus.find((item) => item.cca3 === cca3);

		setSelectedCountry({
			cca3,
			name: country.name,
			status: statusItem?.status || 'none',
			country: country,
		});
		setShowModal(true);
	};

	// const updateCountryStatus = async (
	// 	cca3,
	// 	status,
	// 	startDate,
	// 	endDate,
	// 	note
	// ) => {
	// 	const existing = countryStatus.find((x) => x.cca3 === cca3);

	// 	if (status === 'none') {
	// 		if (existing) {
	// 			await deleteTravelTracker(cca3);
	// 			setCountryStatus((prev) => prev.filter((c) => c.cca3 != existing.cca3));
	// 		}
	// 		setShowModal(false);
	// 		return;
	// 	}

	// 	const payload = {
	// 		cca3,
	// 		status,
	// 		note: note || '',
	// 		startDate: startDate || null,
	// 		endDate: status === 'visited' ? endDate || null : null,
	// 	};

	// 	let updatedList;

	// 	// UPDATE (record đã tồn tại)
	// 	if (existing) {
	// 		const updated = await postTravelTracker(payload);
	// 		updatedList = countryStatus.map((x) => (x.cca3 === cca3 ? updated : x));
	// 	}
	// 	// CREATE (chưa có record)
	// 	else {
	// 		const created = await postTravelTracker(payload);
	// 		updatedList = [...countryStatus, created];
	// 	}

	// 	setCountryStatus(updatedList);
	// 	setShowModal(false);
	// };

	const updateCountryStatus = async (
		cca3,
		status,
		startDate,
		endDate,
		note
	) => {
		const existing = countryStatus.find((x) => x.cca3 === cca3);

		// 🔥 CASE: chọn living → chỉ cho phép 1 nước living
		if (status === 'living') {
			const currentLiving = countryStatus.find(
				(x) => x.status === 'living' && x.cca3 !== cca3
			);

			// Nếu đã có living khác → chuyển nó sang visited
			if (currentLiving) {
				await postTravelTracker({
					...currentLiving,
					status: 'visited',
					endDate: new Date().toISOString().slice(0, 10),
				});
			}
		}

		// ❌ REMOVE
		if (status === 'none') {
			if (existing) {
				await deleteTravelTracker(cca3);
				setCountryStatus((prev) => prev.filter((c) => c.cca3 !== cca3));
			}
			setShowModal(false);
			return;
		}

		const payload = {
			cca3,
			status,
			note: note || '',
			startDate: startDate || null,
			endDate: status === 'visited' ? endDate || null : null,
		};

		let updatedList;

		if (existing) {
			const updated = await postTravelTracker(payload);
			updatedList = countryStatus.map((x) => (x.cca3 === cca3 ? updated : x));
		} else {
			const created = await postTravelTracker(payload);
			updatedList = [...countryStatus, created];
		}

		// 🔁 Update state local cho living cũ → visited
		if (status === 'living') {
			updatedList = updatedList.map((x) =>
				x.status === 'living' && x.cca3 !== cca3
					? { ...x, status: 'visited' }
					: x
			);
		}

		setCountryStatus(updatedList);
		setShowModal(false);
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case 'visited':
				return lang == 'en' ? t('visited') : 'Đã đi';
			case 'bucket':
				return lang == 'en' ? t('bucket') : 'Muốn đi';
			case 'living':
				return lang == 'en' ? t('living') : 'Đang sống';
			default:
				return lang == 'en' ? t('none') : 'Chưa đánh dấu';
		}
	};

	const getStatusColor = (status) => {
		return TRAVEL_COLORS[status] || TRAVEL_COLORS.default;
	};

	const countryStatusMap = useMemo(() => {
		const map = {};
		countryStatus.forEach((item) => {
			map[item.cca3] = item;
		});
		return map;
	}, [countryStatus]);

	const countryList = useMemo(() => {
		if (!countries) return [];

		return countries
			.map((c) => ({
				cca3: c.cca3,
				name: c.name,
				status: countryStatusMap[c.cca3]?.status || 'none',
				flag: c.flag,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [countries, countryStatus]);

	const filteredCountries = useMemo(() => {
		if (!searchTerm) return countryList;
		return countryList.filter((c) =>
			c.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [countryList, searchTerm]);

	// View country details
	const viewCountryDetails = (cca3) => {
		setShowModal(false);
		navigate(`/country/${cca3}`);
	};

	const handleSearchSelect = (country) => {
		if (country && mapRef.current) {
			setSelectedCountryCode(country.cca3);

			// Gọi hàm 'flyTo' của component con
			mapRef.current.flyTo(
				[country.latlng.lng, country.latlng.lat], // [Lng, Lat]
				4 // Zoom
			);
		}
	};

	const allCountryNames = useMemo(() => {
		return countries.map((c) => ({
			cca3: c.cca3,
			name: c.name,
			flag: c.flag,
			latlng: c.latlng,
		}));
	}, [countries, lang]);

	const markedCountries = useMemo(() => {
		return countryList.filter((c) => c.status !== 'none');
	}, [countryList]);

	const flyToCountry = (cca3) => {
		const country = countries.find((c) => c.cca3 === cca3);
		if (!country || !mapRef.current) return;

		// Scroll tới map
		mapContainerRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});

		mapRef.current.flyTo([country.latlng.lng, country.latlng.lat], 4);
	};

	return (
		<div className='space-y-6'>
			{/* Statistics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500 '>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-300 mb-1'>
								{t('visited')}
							</p>
							<p className='text-3xl font-bold text-gray-800 dark:text-gray-200'>
								{stats.visited}
							</p>
							<p className='text-xs text-gray-500 dark:text-gray-300 mt-1'>
								{((stats.visited / countries.length) * 100).toFixed(1)}%{' '}
								{t('world')}
							</p>
						</div>
						<BiMapPin className='text-green-500' size={40} />
					</div>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-500 '>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-300  mb-1'>
								{t('bucket')}
							</p>
							<p className='text-3xl font-bold text-gray-800 dark:text-gray-200'>
								{stats.bucket}
							</p>
							<p className='text-xs text-gray-500 dark:text-gray-300 mt-1'>
								{t('bucket_list')}
							</p>
						</div>
						<BiHeart className='text-yellow-500' size={40} />
					</div>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-gray-600 dark:text-gray-300  mb-1'>
								{t('living')}
							</p>
							<p className='text-3xl font-bold text-gray-800 dark:text-gray-200'>
								{lang == 'vi'
									? getTranslatedName(
											countryStatus.find((item) => item.status === 'living')
												?.name
									  )
									: countryStatus.find((item) => item.status === 'living')
											?.name}
							</p>
						</div>
						<BiHome className='text-blue-500' size={40} />
					</div>
				</div>
			</div>

			{/* Map Container */}
			<div
				ref={mapContainerRef}
				className='bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden relative'>
				<div className='bg-white dark:bg-gray-800  rounded-xl shadow-md overflow-hidden relative'>
					<div className='p-4 bg-gray-50 dark:bg-gray-800  border-b'>
						<div className='flex items-center justify-between flex-wrap gap-4'>
							<div className='flex items-center gap-4 text-sm flex-wrap'>
								<span className='font-semibold text-gray-700 dark:text-gray-300'>
									{t('legend')}:
								</span>
								<div className='flex items-center gap-2'>
									<div
										className='w-4 h-4 rounded'
										style={{ backgroundColor: TRAVEL_COLORS.visited }}></div>
									<span>{t('visited')}</span>
								</div>
								<div className='flex items-center gap-2'>
									<div
										className='w-4 h-4 rounded'
										style={{ backgroundColor: TRAVEL_COLORS.bucket }}></div>
									<span>{t('bucket')}</span>
								</div>
								<div className='flex items-center gap-2'>
									<div
										className='w-4 h-4 rounded'
										style={{ backgroundColor: TRAVEL_COLORS.living }}></div>
									<span>{t('living')}</span>
								</div>
								<div className='flex items-center gap-2'>
									<div
										className='w-4 h-4 rounded'
										style={{ backgroundColor: TRAVEL_COLORS.default }}></div>
									<span>{t('none')}</span>
								</div>
							</div>
							<div className='text-sm text-gray-600'>{t('bookmark_desc')}</div>
						</div>
					</div>

					<div className='absolute top-16 left-4 right-4 z-[999] pointer-events-none'>
						<div className='pointer-events-auto w-full md:w-72 shadow-xl'>
							<CountrySearch
								countries={allCountryNames}
								onSelect={handleSearchSelect}
							/>
						</div>
					</div>

					{/* Sử dụng InteractiveMap component */}

					<div className='w-full h-[450px]'>
						<InteractiveMap
							ref={mapRef}
							geoData={geoData}
							regionColors={travelColors}
							regionFilter='All'
							selectedCountryCode={selectedCountryCode}
							onCountryClick={handleCountryClick}
							countries={countries}
							onTravel={true}
							countryStatus={countryStatus}
						/>
					</div>
				</div>
			</div>

			{/* AI Travel Advisor */}
			<AITravelAdvisor onCountryClick={handleCountryClick} />

			{/* Country List */}
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-md p-6'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-2xl font-bold text-gray-800 dark:text-gray-300'>
						{t('countries_list')}
					</h2>
				</div>

				<div className='mb-4 relative'>
					<BiSearch
						className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
						size={20}
					/>
					<input
						type='text'
						placeholder={t('search_placeholder')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto'>
					{markedCountries.length === 0 && (
						<p className='text-gray-500 col-span-full text-center'>
							Chưa có quốc gia nào được đánh dấu
						</p>
					)}

					{markedCountries.map((country) => (
						<div
							key={country.cca3}
							onClick={() => {
								const fullCountry = countries.find(
									(c) => c.cca3 === country.cca3
								);

								flyToCountry(country.cca3);

								setSelectedCountry({
									...country,
									country: fullCountry,
								});
							}}
							className='p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer'
							style={{
								borderLeftWidth: '8px',
								borderLeftColor: getStatusColor(country.status),
							}}>
							<div className='flex gap-4'>
								<img src={country.flag} alt='' className='w-20' />
								<div>
									<div className='font-semibold text-gray-800 dark:text-gray-300'>
										{lang == 'vi'
											? getTranslatedName(country.name)
											: country.name}
									</div>
									<div className='text-sm text-gray-600 dark:text-gray-300'>
										{getStatusLabel(country.status)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Modal */}
			{showModal && selectedCountry && (
				<div
					className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4'
					onClick={() => {
						setShowModal(false);
						setSelectedCountry(null);
					}}>
					<div
						className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6'
						onClick={(e) => e.stopPropagation()}>
						<div className='flex justify-between items-start mb-4'>
							<h3 className='text-2xl font-bold text-gray-800 dark:text-gray-300'>
								{selectedCountry.name}
							</h3>
							<button
								onClick={() => setShowModal(false)}
								className='text-gray-400 dark:text-gray-300 hover:text-gray-600'>
								<BiX size={24} />
							</button>
						</div>

						<p className='text-gray-600 dark:text-gray-300   mb-6'>
							{t('select_status_for_this_country')}:
						</p>

						<div className='space-y-4'>
							{/* Trạng thái */}
							<div className='space-y-3'>
								<div className='flex gap-2'>
									<button
										onClick={() =>
											setSelectedCountry((s) => ({ ...s, status: 'visited' }))
										}
										className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 ${
											selectedCountry.status === 'visited'
												? 'border-green-600 bg-green-100'
												: 'border-green-500 bg-green-50 hover:bg-green-100'
										}`}>
										<BiMapPin className='text-green-600' size={24} />
										<span className='font-semibold text-green-700'>
											{t('visited')}
										</span>
									</button>

									<button
										onClick={() =>
											setSelectedCountry((s) => ({ ...s, status: 'bucket' }))
										}
										className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 ${
											selectedCountry.status === 'bucket'
												? 'border-yellow-600 bg-yellow-100'
												: 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100'
										}`}>
										<BiHeart className='text-yellow-600' size={24} />
										<span className='font-semibold text-yellow-700'>
											{t('bucket')}
										</span>
									</button>
								</div>
								<button
									onClick={() =>
										setSelectedCountry((s) => ({ ...s, status: 'living' }))
									}
									className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 ${
										selectedCountry.status === 'living'
											? 'border-blue-600 bg-blue-100'
											: 'border-blue-500 bg-blue-50 hover:bg-blue-100'
									}`}>
									<BiHome className='text-blue-600' size={24} />
									<span className='font-semibold text-blue-700'>
										{t('living')}
									</span>
								</button>
							</div>

							{/* --- INPUT DATE --- */}
							{(selectedCountry.status === 'visited' ||
								selectedCountry.status === 'bucket') && (
								<div className='space-y-3'>
									{/* Ngày bắt đầu */}
									<div>
										<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-1'>
											{selectedCountry.status === 'bucket'
												? t('end_day')
												: t('start_day')}
										</label>
										<input
											type='date'
											className='w-full border p-2 rounded-lg'
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
										/>
									</div>

									{/* Ngày kết thúc chỉ cho visited */}
									{selectedCountry.status === 'visited' && (
										<div>
											<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-1'>
												{t('end_day')}
											</label>
											<input
												type='date'
												className='w-full border p-2 rounded-lg'
												value={endDate}
												onChange={(e) => setEndDate(e.target.value)}
											/>
										</div>
									)}
								</div>
							)}

							{/* --- NOTE --- */}
							<div>
								<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-1'>
									{t('note')}
								</label>
								<textarea
									rows={3}
									className='w-full border p-2 rounded-lg'
									value={note}
									onChange={(e) => setNote(e.target.value)}
								/>
							</div>

							{/* BUTTON SAVE */}
							<button
								onClick={() =>
									updateCountryStatus(
										selectedCountry.cca3,
										selectedCountry.status,
										startDate,
										endDate,
										note
									)
								}
								className='w-full p-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer'>
								{t('save_change')}
							</button>

							{/* Delete */}
							{selectedCountry.status !== 'none' && (
								<button
									onClick={() =>
										updateCountryStatus(selectedCountry.cca3, 'none')
									}
									className='w-full p-4 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-100  cursor-pointer'>
									{t('remove_mark')}
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TravelTracker;
