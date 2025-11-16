import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import Map, { Layer, Popup, Source } from 'react-map-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Lớp viền
const borderLayerStyle = {
    id: 'countries-border',
    type: 'line',
    paint: {
        'line-color': '#212529',
        'line-width': 1
    }
};

const InteractiveMap = forwardRef((props, ref) => {
    const {
        geoData,
        regionColors,
        regionFilter,
        selectedCountryCode,
        onCountryClick
    } = props;

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
                    duration: 2000
                });
            }
        }
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
                regionColors.Default
            ];
            return {
                id: 'countries-fill',
                type: 'fill',
                paint: { 'fill-color': matchExpression, 'fill-opacity': 0.8 }
            };
        }

        // 2. Ưu tiên filter châu lục
        if (regionFilter !== 'All') {
            let matchExpression;
            if (regionFilter === 'Americas') {
                matchExpression = [
                    'match',
                    ['get', 'continent'],
                    ['North America', 'South America'], regionColors.Americas,
                    regionColors.Default
                ];
            } else {
                matchExpression = [
                    'match',
                    ['get', 'continent'],
                    regionFilter, regionColors[regionFilter],
                    regionColors.Default
                ];
            }
            return {
                id: 'countries-fill',
                type: 'fill',
                paint: { 'fill-color': matchExpression, 'fill-opacity': 0.7 }
            };
        }

        // 3. Mặc định
        return {
            id: 'countries-fill',
            type: 'fill',
            paint: { 'fill-color': regionColors.Default, 'fill-opacity': 0.7 }
        };
    }, [regionFilter, selectedCountryCode, regionColors]);

    // Xử lý khi rê chuột (Hover)
    const onHover = (event) => {
        const { features } = event;
        const hoveredFeature = features && features[0];

        if (hoveredFeature) {
            const props = hoveredFeature.properties;
            setHoverInfo({
                longitude: event.lngLat.lng,
                latitude: event.lngLat.lat,
                name: props.name,
                // Dùng pop_est, vì GeoJSON của bạn có thuộc tính này
                population: props.pop_est.toLocaleString('en-US')
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

    return (
        <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
                longitude: 0,
                latitude: 20,
                zoom: 2
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/navigation-day-v1"
            onMouseMove={onHover}
            onClick={onClick}
            interactiveLayerIds={['countries-fill']}
        >
            {geoData && (
                <Source type="geojson" data={geoData}>
                    <Layer {...fillLayerStyle} />
                    <Layer {...borderLayerStyle} />
                </Source>
            )}

            {hoverInfo && (
                <Popup
                    longitude={hoverInfo.longitude}
                    latitude={hoverInfo.latitude}
                    closeButton={false}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={10}
                    className="font-sans"
                >
                    <div>
                        <h3 className="font-bold text-gray-800">{hoverInfo.name}</h3>
                        {/* Đã sửa 'population' */}
                        <p className="text-sm text-gray-600">Pop: {hoverInfo.population}</p>
                    </div>
                </Popup>
            )}
        </Map>
    )
});

export default InteractiveMap