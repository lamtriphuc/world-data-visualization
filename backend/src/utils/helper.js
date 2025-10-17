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