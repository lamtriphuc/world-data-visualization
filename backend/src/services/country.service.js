import { STANDARD_195_CCA3 } from '../constants/countryList.js';
import Country from '../models/Country.js';
import {
	formatCountryBasic,
	formatCountryDetail,
	formatCountryName,
} from '../utils/countryFormatter.js';

export const getAllCountriesService = async ({
	region,
	subregion,
	search,
	independent = true,
	page = 1,
	limit = 25,
	sortBy = 'name',
	sortOrder = 1,
}) => {
	const query = {};

	if (region) query.region = region;
	if (subregion) query.subregion = subregion;
	query.independent = independent;
	if (search) {
		query.$or = [
			{ 'name.common': { $regex: search, $options: 'i' } },
			{ 'name.official': { $regex: search, $options: 'i' } },
			{ cca2: { $regex: search, $options: 'i' } },
			{ cca3: { $regex: search, $options: 'i' } },
		];
	}

	const skip = (page - 1) * limit;

	// Determine sort criteria
	let sortCriteria = { 'name.common': 1 };
	if (sortBy === 'population') {
		sortCriteria = { 'population.value': Number(sortOrder) };
	} else if (sortBy === 'area') {
		sortCriteria = { area: Number(sortOrder) };
	}

	const [countries, total] = await Promise.all([
		Country.find(query)
			.sort(sortCriteria)
			.skip(skip)
			.limit(Number(limit))
			.lean(),
		Country.countDocuments(query),
	]);

	const response = countries.map((c) => formatCountryBasic(c));

	return {
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit),
		data: response,
	};
};

export const getCountryByCodeService = async (code) => {
	const country = await Country.findOne({
		$or: [{ cca3: code.toUpperCase() }, { cca2: code.toUpperCase() }],
	}).lean();

	if (!country) return null;

	if (!country.borders || country.borders.length === 0) {
		return formatCountryDetail({ ...country, borders: [] });
	}

	const borderCountries = await Country.find(
		{ cca3: { $in: country.borders } },
		{ name: 1, cca3: 1 }
	).lean();

	const borderNames = borderCountries.map((c) => c.name?.common);

	return formatCountryDetail({
		...country,
		borders: borderNames,
	});
};

export const getCountriesByListService = async (listCode) => {
	const res = await Country.find({
		cca3: { $in: listCode },
	});

	return res.map((c) => formatCountryBasic(c));
};

export const getLatestGdpService = async (cca3) => {
	const country = await Country.findOne({ cca3: cca3.toUpperCase() }).lean();
	if (!country) return null;

	const latest = country.gdp.length
		? country.gdp.reduce((a, b) => (a.year > b.year ? a : b))
		: null;

	return latest;
};

export const getGdpOf10YearService = async (cca3) => {
	const country = await Country.find({ cca3: cca3.toUpperCase() }).lean();
	return country.gdp || null;
};

export const getAllCountryNamesService = async () => {
	const countries = await Country.find({ independent: true })
		.select('name cca2 cca3 latlng flags')
		.lean();
	const res = countries.map((c) => formatCountryName(c));

	return res;
};

export const getTop10PopulationService = async (region) => {
	const filter = { independent: true };
	if (region) {
		filter.region = region;
	}
	const countries = await Country.find(filter)
		.sort({ 'population.value': -1 })
		.limit(10);

	return countries.map((c) => formatCountryDetail(c));
};

export const getTop10AreaService = async (region) => {
	const filter = { independent: true };
	if (region) {
		filter.region = region;
	}
	const countries = await Country.find(filter).sort({ area: -1 }).limit(10);

	return countries.map((c) => formatCountryDetail(c));
};

export const getTop10BordersService = async () => {
	const countries = await Country.aggregate([
		{ $match: { independent: true, borders: { $exists: true, $ne: [] } } },
		{
			$project: {
				name: '$name.common',
				cca3: 1,
				flag: '$flags.svg',
				num_borders: { $size: '$borders' },
			},
		},
		{ $sort: { num_borders: -1 } },
		{ $limit: 10 },
	]);

	return countries;
};

export const getMaxArea = async () => {
	const country = await Country.findOne({ independent: true })
		.sort({ area: -1 })
		.lean();

	return formatCountryBasic(country);
};

export const getMaxPopulation = async () => {
	const country = await Country.findOne({ independent: true })
		.sort({ population: -1 })
		.lean();

	return formatCountryBasic(country);
};

export const getDataChartService = async (region) => {
	if (!region) throw new Error('Region not found');

	const [populationList, areaList] = await Promise.all([
		Country.find({ region, independent: true })
			.sort({ 'population.value': -1 })
			.limit(10)
			.select({ 'name.common': 1, 'population.value': 1, _id: 0 })
			.lean(),

		Country.find({ region, independent: true })
			.sort({ area: -1 })
			.limit(10)
			.select({ 'name.common': 1, area: 1, _id: 0 })
			.lean(),
	]);

	return {
		populationList: populationList.map((c) => ({
			name: c.name.common,
			value: c.population?.value || 0,
		})),
		areaList: areaList.map((c) => ({
			name: c.name.common,
			value: c.area || 0,
		})),
	};
};

export const getLanguageDistributionService = async (region) => {
	try {
		// 1. Tạo đk (Match Stage)
		const matchStage = {
			cca3: { $in: STANDARD_195_CCA3 },
			languages: { $exists: true, $ne: null }, // bỏ qua null
		};

		if (region) {
			matchStage.region = region;
		}

		const stats = await Country.aggregate([
			{ $match: matchStage },

			//  Object { key: value } -> [{k: key, v: value}]
			// VD: { eng: "English" } -> [{ k: "eng", v: "English" }]
			{
				$project: {
					languageArray: { $objectToArray: '$languages' },
				},
			},

			// Tách mảng ra từng dòng document riêng biệt
			{ $unwind: '$languageArray' },

			// Gom nhóm theo TÊN ngôn ngữ (value)
			{
				$group: {
					_id: '$languageArray.v', // Group theo "English", "Vietnamese"...
					count: { $sum: 1 }, // đếm
				},
			},

			{ $sort: { count: -1, _id: 1 } },

			{ $limit: 10 },
		]);

		return {
			chartData: {
				labels: stats.map((item) => item._id),
				data: stats.map((item) => item.count),
			},
			raw: stats, // data thô tư trên
		};
	} catch (error) {
		throw new Error(`Error aggregate language: ${error.message}`);
	}
};
