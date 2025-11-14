// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Source, Layer, Popup } from 'react-map-gl';
import CountrySearch from '../components/Layout/CountrySearch'; // Sẽ tạo ở dưới
import RegionFilter from '../components/Layout/RegionFilter'; // Sẽ tạo ở dưới
import { getAllCountryNames } from '../services/country.service';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// 1. Định nghĩa màu cho các châu lục (bạn có thể đổi)
const regionColors = {
    'Asia': '#E63946',
    'Europe': '#457B9D',
    'Africa': '#F4A261',
    'Americas': '#2A9D8F',
    'Oceania': '#A8DADC',
    'Default': '#F1FAEE' // Màu khi không lọc
};

const Home = () => {
    const navigate = useNavigate();
    const mapRef = useRef();
    const [geoData, setGeoData] = useState(null);
    const [allCountries, setAllCountries] = useState([]); // Dùng cho tìm kiếm
    const [regionFilter, setRegionFilter] = useState('All');
    const [hoverInfo, setHoverInfo] = useState(null);

    // 2. Tải dữ liệu GeoJSON (cho bản đồ) và Dữ liệu API (cho tìm kiếm)
    useEffect(() => {
        // Tải GeoJSON cho hình dạng bản đồ
        fetch('/countries.geojson')
            .then(resp => resp.json())
            .then(json => setGeoData(json))
            .catch(err => console.error("Could not load geojson:", err));

        // Tải danh sách quốc gia (nhẹ hơn) cho thanh tìm kiếm
        // (Giả sử bạn có API endpoint /api/countries?basic=true trả về [{ name, cca3, latlng }])
        const fetchAllCountryNames = async () => {
            try {
                const res = await getAllCountryNames();
                setAllCountries(res);
            } catch (error) {
                console.log('fetchAllCountryNames ', error)
            }
        }

        fetchAllCountryNames();
    }, []);

    console.log(allCountries)

    // 3. Hàm xử lý khi chọn một quốc gia từ thanh tìm kiếm
    const handleSearchSelect = (country) => {
        if (country && mapRef.current) {
            mapRef.current.flyTo({
                center: [country.latlng.lng, country.latlng.lat], // Mapbox dùng [lng, lat]
                zoom: 4,
                duration: 2000 // 2 giây
            });
        }
    };

    // 4. Xử lý khi rê chuột (Hover)
    const onHover = (event) => {
        const { features, point } = event;
        const hoveredFeature = features && features[0];

        if (hoveredFeature) {
            // Lấy thông tin cần thiết từ properties của GeoJSON
            const props = hoveredFeature.properties;
            setHoverInfo({
                longitude: event.lngLat.lng,
                latitude: event.lngLat.lat,
                name: props.name_common,
                flag: props.flag_emoji, // Giả sử GeoJSON có
                population: props.population.toLocaleString('en-US')
            });
            // Đổi con trỏ chuột
            event.target.getCanvas().style.cursor = 'pointer';
        } else {
            setHoverInfo(null);
            event.target.getCanvas().style.cursor = '';
        }
    };

    // 5. Xử lý khi nhấp chuột (Click)
    const onClick = (event) => {
        const feature = event.features && event.features[0];
        if (feature) {
            const cca3 = feature.properties.cca3;
            if (cca3) {
                navigate(`/country/${cca3}`);
            }
        }
    };

    // 6. Tạo style cho lớp (layer) tô màu, thay đổi dựa trên bộ lọc
    const fillLayerStyle = useMemo(() => {
        if (regionFilter === 'All') {
            return {
                id: 'countries-fill',
                type: 'fill',
                paint: {
                    'fill-color': regionColors.Default,
                    'fill-opacity': 0.7
                }
            };
        }

        // Đây là "Data-Driven Styling" của Mapbox
        const matchExpression = ['match', ['get', 'region']]; // Lấy thuộc tính 'region'
        for (const [region, color] of Object.entries(regionColors)) {
            if (region !== 'Default') {
                matchExpression.push(region, color);
            }
        }
        matchExpression.push(regionColors.Default); // Màu mặc định cuối cùng

        return {
            id: 'countries-fill',
            type: 'fill',
            paint: {
                'fill-color': matchExpression,
                'fill-opacity': 0.7
            }
        };
    }, [regionFilter]);

    // Lớp viền
    const borderLayerStyle = {
        id: 'countries-border',
        type: 'line',
        paint: {
            'line-color': '#212529',
            'line-width': 1
        }
    };

    return (
        <div className="relative w-full h-screen">
            {/* === Thanh Header chứa Tìm kiếm và Lọc === */}
            <div className="absolute top-0 left-0 right-0 z-5 p-4 flex flex-col md:flex-row gap-4">
                <CountrySearch
                    countries={allCountries}
                    onSelect={handleSearchSelect}
                />
                <RegionFilter
                    regions={Object.keys(regionColors).filter(r => r !== 'Default')}
                    selectedRegion={regionFilter}
                    onFilterChange={setRegionFilter}
                />
            </div>

            {/* === Bản đồ === */}
            <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    longitude: 0,
                    latitude: 20,
                    zoom: 1
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v10" // Dùng style sáng
                onMouseMove={onHover}
                onClick={onClick}
                interactiveLayerIds={['countries-fill']} // Chỉ bắt sự kiện trên lớp này
            >
                {geoData && (
                    <Source type="geojson" data={geoData}>
                        <Layer {...fillLayerStyle} />
                        <Layer {...borderLayerStyle} />
                    </Source>
                )}

                {/* === Tooltip khi Hover === */}
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
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{hoverInfo.flag}</span>
                            <div>
                                <h3 className="font-bold text-gray-800">{hoverInfo.name}</h3>
                                <p className="text-sm text-gray-600">Pop: {hoverInfo.population}</p>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}

export default Home;