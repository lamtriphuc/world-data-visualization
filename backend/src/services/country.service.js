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
	page = 1,
	limit = 25,
	sortBy = 'name',
	sortOrder = 1,
}) => {
	const query = {};

	if (region) query.region = region;
	if (subregion) query.subregion = subregion;
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
		Country.find(query).sort(sortCriteria).skip(skip).limit(Number(limit)),
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
	});

	return formatCountryDetail(country);
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
	const countries = await Country.find();
	const res = countries.map((c) => formatCountryName(c));

	return res;
};

export const getTop10PopulationService = async () => {
	const countries = await Country.find({})
		.sort({ 'population.value': -1 })
		.limit(10);

	// Định dạng kết quả trả về
	return countries.map((c) => formatCountryDetail(c));
};

export const getTop10AreaService = async () => {
	const countries = await Country.find({})
		.sort({ 'area': -1 })
		.limit(10);

	// Định dạng kết quả trả về
	return countries.map((c) => formatCountryDetail(c));
};

export const getGlobalStatsService = async () => {
	// 1. Lấy tổng số quốc gia
	const totalCountries = await Country.countDocuments({});

	// 2. Dùng Aggregation để tính tổng dân số và đếm số region
	const stats = await Country.aggregate([
		{
			// Nhóm TẤT CẢ document lại làm 1 (_id: null)
			$group: {
				_id: null,
				// Tính tổng của trường 'population.value'
				totalPopulation: { $sum: '$population.value' },
				// Thêm các 'region' duy nhất vào một mảng
				regionSet: { $addToSet: '$region' }
			}
		},
		{
			// Định dạng lại output
			$project: {
				_id: 0,
				totalPopulation: 1, // Giữ lại tổng dân số
				totalRegions: { $size: '$regionSet' } // Đếm số phần tử trong mảng regionSet
			}
		}
	]);

	if (stats.length === 0) {
		return {
			totalCountries: 0,
			totalPopulation: 0,
			totalRegions: 0
		};
	}

	return {
		totalCountries,
		totalPopulation: stats[0].totalPopulation,
		totalRegions: stats[0].totalRegions
	};
};