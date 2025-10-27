import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MiniMap = ({ lat, lng }) => {
	const [showLargeMap, setShowLargeMap] = useState(false);
	const [viewState, setViewState] = useState({
		longitude: lng,
		latitude: lat,
		zoom: 4,
	});
	const { t } = useTranslation();

	useEffect(() => {
		if (lat && lng) {
			setViewState({
				longitude: lng,
				latitude: lat,
				zoom: 4,
			});
		}
	}, [lat, lng]);

	if (!lat || !lng) {
		return <div>Loading map...</div>;
	}

	return (
		<>
			<div
				onClick={() => setShowLargeMap(true)}
				className='relative w-full h-96 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 mt-4'>
				<Map
					{...viewState}
					onMove={(evt) => setViewState(evt.viewState)}
					style={{ width: '100%', height: '100%' }}
					mapStyle='mapbox://styles/mapbox/navigation-day-v1'
					mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
					interactive={true}>
					<Marker longitude={lng} latitude={lat} color='red' />
				</Map>
				<div className='absolute bottom-2 right-2 bg-gray-900/70 text-white text-xs px-3 py-1 rounded'>
					{t('expand')}
				</div>
			</div>

			{showLargeMap && (
				<div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center'>
					<div className='relative w-[90%] h-[80%] bg-gray-900 rounded-lg overflow-hidden shadow-2xl'>
						<Map
							initialViewState={{
								longitude: lng,
								latitude: lat,
								zoom: 5,
							}}
							mapStyle='mapbox://styles/mapbox/navigation-day-v1'
							mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}>
							<Marker longitude={lng} latitude={lat} color='red' />
						</Map>

						{/* Close button */}
						<button
							onClick={() => setShowLargeMap(false)}
							className='absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700'>
							X
						</button>
					</div>
				</div>
			)}
		</>
	);
};
export default MiniMap;
