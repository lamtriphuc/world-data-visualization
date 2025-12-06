export const extractNativeName = (nativeName) => {
    if (!nativeName) return { official: '', common: '' };
    const firstLang = Object.values(nativeName)[0];
    return {
        official: firstLang?.official || '',
        common: firstLang?.common || ''
    };
};

export const extractCurrency = (currency) => {
    if (!currency) return { name: '', symbol: '' };
    const firstLang = Object.values(currency)[0];
    return {
        name: firstLang?.name || '',
        symbol: firstLang?.symbol || ''
    };
};

// export const extractCurrency = (currencies) => {
//     if (!currencies || typeof currencies !== 'object') return [];

//     return Object.entries(currencies).map(([code, info]) => ({
//         code,
//         name: info?.name || '',
//         symbol: info?.symbol || ''
//     }));
// };

export function haversine(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return (x * Math.PI) / 180;
    }
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Tính score dựa trên RESTCountries data
export function similarityScore(source, target) {
    let score = 0;

    if (source.continent === target.continent) score += 3;
    if (source.subregion && source.subregion === target.subregion) score += 2;

    const srcLangs = Object.keys(source.languages || {});
    const tgtLangs = Object.keys(target.languages || {});
    if (srcLangs.some((l) => tgtLangs.includes(l))) score += 2;

    if (source.borders && target.borders) {
        if (source.borders.some((b) => target.borders.includes(b))) {
            score += 3;
        }
    }

    if (source.latlng?.lat && target.latlng?.lat) {
        const d = haversine(
            source.latlng.lat,
            source.latlng.lng,
            target.latlng.lat,
            target.latlng.lng
        );
        if (d < 1000) score += 2;
        else if (d < 3000) score += 1;
    }

    return score;
}