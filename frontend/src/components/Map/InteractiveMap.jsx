import React, {
	forwardRef,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import Map, { Layer, Popup, Source } from 'react-map-gl';
import translated from '../../scripts/countries_translated.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Lớp viền
const borderLayerStyle = {
	id: 'countries-border',
	type: 'line',
	paint: {
		'line-color': '#212529',
		'line-width': 1,
	},
};

const getTranslatedName = (name) => {
	const found = translated.find((c) => c.name === name);
	return found?.name_vi || name;
};

const InteractiveMap = forwardRef((props, ref) => {
	const {
		geoData,
		regionColors,
		regionFilter,
		selectedCountryCode,
		onCountryClick,
		countries,
		onTravel = false,
		countryStatus
	} = props;
	const { t } = useTranslation();
	const currentLang = localStorage.getItem('lang');
	const mapRef = useRef();
	const [hoverInfo, setHoverInfo] = useState(null);

	// --- Logic nội bộ của Map ---

	// Expose hàm flyTo cho component cha (HomePage)
	useImperativeHandle(ref, () => ({
		flyTo(center, zoom) {
			if (mapRef.current) {
				mapRef.current.flyTo({
					center,
					zoom: zoom,
					duration: 2000,
				});
			}
		},
	}));

	// Logic tô màu (giữ nguyên như cũ, chỉ phụ thuộc vào props)
	const fillLayerStyle = useMemo(() => {
		const SELECTED_COUNTRY_COLOR = '#F9A825';

		// 1. Ưu tiên filter country
		if (selectedCountryCode) {
			const matchExpression = [
				'match',
				['get', 'iso_a3'], // Lấy mã 'iso_a3' từ GeoJSON
				selectedCountryCode,
				SELECTED_COUNTRY_COLOR,
				regionColors.Default,
			];
			return {
				id: 'countries-fill',
				type: 'fill',
				paint: { 'fill-color': matchExpression, 'fill-opacity': 0.8 },
			};
		}

		// 2. Ưu tiên filter châu lục
		if (regionFilter !== 'All') {
			let matchExpression;
			if (regionFilter === 'Americas') {
				matchExpression = [
					'match',
					['get', 'continent'],
					['North America', 'South America'],
					regionColors.Americas,
					regionColors.Default,
				];
			} else {
				matchExpression = [
					'match',
					['get', 'continent'],
					regionFilter,
					regionColors[regionFilter],
					regionColors.Default,
				];
			}
			return {
				id: 'countries-fill',
				type: 'fill',
				paint: { 'fill-color': matchExpression, 'fill-opacity': 0.7 },
			};
		}

		// 3. Mặc định
		return {
			id: 'countries-fill',
			type: 'fill',
			paint: { 'fill-color': regionColors.Default, 'fill-opacity': 0.7 },
		};
	}, [regionFilter, selectedCountryCode, regionColors]);

	const travelLayerStyle = useMemo(() => {
		if (!onTravel || !regionColors) return null;

		const matchExpression = ['match', ['get', 'iso_a3']];

		Object.entries(regionColors).forEach(([code, color]) => {
			matchExpression.push(code, color);
		});

		matchExpression.push('rgba(0,0,0,0)'); // default 

		return {
			id: 'travel-fill',
			type: 'fill',
			paint: {
				'fill-color': matchExpression,
				'fill-opacity': 0.7,
			},
		};
	}, [regionColors, onTravel]);

	const populationMap = useMemo(() => {
		if (!countries) return;

		const map = {};
		countries.forEach((c) => {
			map[c.cca3] = {
				population: c.population.value,
				area: c.area,
			};
		});
		return map;
	}, [countries]);

	const countryStatusMap = useMemo(() => {
		if (!countryStatus) return {};
		const map = {};
		countryStatus.forEach((item) => {
			map[item.cca3] = item;
		});
		return map;
	}, [countryStatus]);

	// Xử lý khi rê chuột (Hover)
	const onHover = (event) => {
		const { features } = event;
		const hoveredFeature = features && features[0];

		if (hoveredFeature) {
			const props = hoveredFeature.properties;
			const iso3 = props.iso_a3;
			const travelInfo = countryStatusMap[iso3];
			const newInfo = populationMap[iso3];

			setHoverInfo({
				longitude: event.lngLat.lng,
				latitude: event.lngLat.lat,
				name: props.name,
				// Dùng pop_est, vì GeoJSON của bạn có thuộc tính này
				population: newInfo?.population
					? newInfo.population.toLocaleString('en-US')
					: props.pop_est.toLocaleString('en-US'),
				area: newInfo?.area
					? newInfo.area.toLocaleString('en-US')
					: props.pop_est.toLocaleString('en-US'),
				status: travelInfo?.status || null,
				startDate: travelInfo?.startDate || null,
				endDate: travelInfo?.endDate || null,
				note: travelInfo?.note || '',
			});
			event.target.getCanvas().style.cursor = 'pointer';
		} else {
			setHoverInfo(null);
			event.target.getCanvas().style.cursor = '';
		}
	};

	// Xử lý khi nhấp chuột (Click)
	const onClick = (event) => {
		const feature = event.features && event.features[0];
		if (feature) {
			// Dùng iso_a3, vì GeoJSON của bạn có thuộc tính này
			const countryCode = feature.properties.iso_a3;
			if (countryCode && onCountryClick) {
				// Gọi hàm prop từ cha

				onCountryClick(countryCode);
			}
		}
	};

	const formatDDMMYYYY = (dateString) => {
		if (!dateString) return '';
		const d = new Date(dateString);
		return `${String(d.getDate()).padStart(2, '0')}/${String(
			d.getMonth() + 1
		).padStart(2, '0')}/${d.getFullYear()}`;
	};

	return (
		<Map
			ref={mapRef}
			mapboxAccessToken={MAPBOX_TOKEN}
			initialViewState={{
				longitude: 0,
				latitude: 20,
				zoom: 2,
			}}
			style={{ width: '100%', height: '100%' }}
			mapStyle='mapbox://styles/mapbox/navigation-day-v1'
			onMouseMove={onHover}
			onClick={onClick}
			// interactiveLayerIds={[onTravel ? 'travel-fill' : 'countries-fill']}
			interactiveLayerIds={['countries-click']}
		// interactiveLayerIds={['countries-fill', 'travel-fill']}
		>
			{geoData && (
				<Source type='geojson' data={geoData}>
					{onTravel && travelLayerStyle && (
						<Layer {...travelLayerStyle} />
					)}

					{!onTravel && fillLayerStyle && (
						<Layer {...fillLayerStyle} />
					)}

					<Layer
						id="countries-click"
						type="fill"
						paint={{ 'fill-opacity': 0 }}
					/>

					<Layer {...borderLayerStyle} />
				</Source>
			)}

			{hoverInfo && (
				<Popup
					longitude={hoverInfo.longitude}
					latitude={hoverInfo.latitude}
					closeButton={false}
					closeOnClick={false}
					anchor='bottom'
					offset={10}
					className='font-sans'>
					<div>
						<h3 className='font-bold text-gray-800'>
							{currentLang === 'vi'
								? getTranslatedName(hoverInfo.name)
								: hoverInfo.name}
						</h3>
						{hoverInfo.status && (
							<p className='text-sm font-semibold text-blue-600'>
								{t(hoverInfo.status)}
							</p>
						)}

						{hoverInfo.startDate && (
							<p className='text-sm text-gray-600'>
								{t('start_day')}: {formatDDMMYYYY(hoverInfo.startDate)}
							</p>
						)}

						{hoverInfo.endDate && (
							<p className='text-sm text-gray-600'>
								{t('end_day')}: {formatDDMMYYYY(hoverInfo.endDate)}
							</p>
						)}

						{hoverInfo.note && (
							<p className='text-sm italic text-gray-500'>
								{t('note')}: “{hoverInfo.note}”
							</p>
						)}
						<hr />
						<p className='text-sm text-gray-600'>
							{t('population')}: {hoverInfo.population}
						</p>
						<p className='text-sm text-gray-600'>
							{t('area')}: {hoverInfo.area}
						</p>
					</div>
				</Popup>
			)}
		</Map>
	);
});

export default InteractiveMap;
