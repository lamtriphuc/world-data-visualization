import fs from 'fs';
import axios from 'axios'; // Cần cài: npm install axios

const API_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,independent';

async function fetchAndFilter() {
	try {
		console.log('🌍 Đang tải dữ liệu từ API...');
		const res = await axios.get(API_URL);
		const allData = res.data;

		const independentCountries = allData.filter(c => c.independent === true);

		const filtered = independentCountries.map((c) => ({
			name: c?.name?.common || '',
			officialName: c?.name?.official || '',
		}));

		fs.writeFileSync(
			'./src/scripts/allCountries.json',
			JSON.stringify(filtered, null, 2),
			'utf-8'
		);
		console.log('✅ Đã lọc xong và lưu vào allCountries.json');
	} catch (err) {
		console.error('❌ Lỗi khi tải dữ liệu:', err.message);
	}
}

fetchAndFilter();
