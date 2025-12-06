import { extractCurrency, extractNativeName } from './helper.js';

// for page list country
export const formatCountryBasic = (country) => {
	if (!country) return;

	return {
		cca2: country.cca2,
		cca3: country.cca3,
		name: country.name.common,
		area: country.area,
		population: country.population,
		region: country.region,
		capital: country.capital,
		flag: country.flags?.svg || country.flags?.png || '',
	};
};

export const formatCountryDetail = (country) => {
	if (!country) return;

	const { official: nativeOfficial, common: nativeCommon } = extractNativeName(
		country.name.nativeName
	);
	const { name: currencyName, symbol: currencySymbol } = extractCurrency(
		country.currencies
	);

	const currency = currencyName ? `${currencyName} (${currencySymbol})` : '';

	return {
		name: country.name?.common,
		area: country.area,
		cca3: country.cca3,
		cca2: country.cca2,
		cioc: country.cioc,
		borders: country.borders,
		officialName: country.name?.official,
		nativeCommon,
		nativeOfficial,
		population: country.population,
		region: country.region,
		subregion: country.subregion,
		capital: country.capital,
		latlng: country.latlng,
		languages: Object.values(country.languages || []),
		currencies: currency,
		gdp: country.gdp,
		flag: country.flags.svg || country.flags.png || '',
		timezones: country.timezones,
		maps: country.maps,
	};
};

export const formatCountryName = (country) => {
	if (!country) return;

	return {
		cca3: country.cca3,
		name: country?.name?.common,
		latlng: country?.latlng,
		flag: country.flags.svg || country.flags.png || '',
	};
};
