import { extractCurrency, extractNativeName } from "./helper.js";

// for page list country
export const formatCountryBasic = (country) => {
    if (!country) return;

    return {
        cca2: country.cca2,
        cca3: country.cca3,
        name: country.name.common,
        population: country.population,
        region: country.region,
        capital: country.capital,
        flag: country.flags?.svg || country.flags?.png || ''
    }
}

export const formatCountryDetail = (country) => {
    if (!country) return;

    const { official: nativeOfficial, common: nativeCommon } = extractNativeName(country.name.nativeName);
    const { name: currencyName, symbol: currencySymbol } = extractCurrency(country.currencies);

    return {
        name: country.name?.common,
        officialName: country.name?.official,
        nativeCommon,
        nativeOfficial,
        population: country.population,
        region: country.region,
        subregion: country.subregion,
        capital: country.capital,
        languages: Object.values(country.languages || []),
        currencies: `${currencyName} (${currencySymbol})`,
        flag: country.flags.svg || country.flags.png || '',
        maps: country.maps
    }
}