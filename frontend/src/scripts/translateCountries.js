// scripts/translateWithLibre.js
import fs from 'fs';
import path from 'path';
import url from 'url';
import process from 'process';
import chalk from 'chalk';

// === Cấu hình đường dẫn file ===
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, './allCountries.json');
const OUTPUT_FILE = path.resolve(__dirname, './countries_translated.json');

// === Hàm tiện ích ===
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(500); // 3-5s để tránh rate limit

// === Kiểm tra file nguồn ===
if (!fs.existsSync(INPUT_FILE)) {
	console.error(chalk.red(`❌ Không tìm thấy file ${INPUT_FILE}`));
	process.exit(1);
}

const allCountries = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

// === Resume ===
let translatedCountries = [];
if (fs.existsSync(OUTPUT_FILE)) {
	translatedCountries = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
	console.log(
		chalk.yellow(
			`🔁 Tiếp tục dịch từ ${translatedCountries.length}/${allCountries.length}`
		)
	);
}
const translatedSet = new Set(translatedCountries.map((c) => c.cca3));

// === Hàm dịch với MyMemory API ===
async function translateText(text, retries = 3) {
	if (!text) return '';

	for (let i = 0; i < retries; i++) {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

			const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
				text
			)}&langpair=en|vi`;
			const response = await fetch(url, { signal: controller.signal });

			clearTimeout(timeout);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			// Check response quality
			if (data.responseData && data.responseData.translatedText) {
				const translated = data.responseData.translatedText;

				// MyMemory trả về text gốc nếu không dịch được
				// hoặc có thể có warning message
				if (translated === text || translated.includes('MYMEMORY WARNING')) {
					throw new Error('Translation failed or rate limited');
				}

				return translated;
			}
		} catch (err) {
			if (i === retries - 1) {
				console.error(chalk.yellow(`⚠️ MyMemory API thất bại: ${err.message}`));
			} else {
				await delay(1000 * (i + 1)); // Exponential backoff
			}
		}
	}

	// Fallback: Dịch thủ công bằng dictionary đơn giản
	return translateSimple(text);
}

// === Dictionary fallback cho các trường hợp dịch lỗi ===
function translateSimple(text) {
	const dict = {
		Republic: 'Cộng hòa',
		Kingdom: 'Vương quốc',
		Democratic: 'Dân chủ',
		Federal: 'Liên bang',
		Islamic: 'Hồi giáo',
		United: 'Thống nhất',
		"People's": 'Nhân dân',
		State: 'Bang',
		Island: 'Đảo',
		Islands: 'Quần đảo',
		and: 'và',
		of: 'của',
		the: '',
	};

	let translated = text;
	for (const [en, vi] of Object.entries(dict)) {
		translated = translated.replace(new RegExp(`\\b${en}\\b`, 'gi'), vi);
	}

	return translated.trim().replace(/\s+/g, ' ');
}

// === Hàm chính ===
async function translateAll() {
	for (const [index, country] of allCountries.entries()) {
		if (translatedSet.has(country.cca3)) continue;

		const { name, officialName, translations = {} } = country;
		let name_vi = '';
		let officialName_vi = '';

		try {
			// Ưu tiên dùng translation từ RestCountries
			if (translations?.vie) {
				name_vi = translations.vie.common;
				officialName_vi = translations.vie.official;
				console.log(
					chalk.green(`✅ [${index + 1}] ${name} → ${name_vi} (từ API)`)
				);
			} else {
				// Dịch bằng LibreTranslate
				console.log(chalk.cyan(`🌍 [${index + 1}] Dịch: ${name}...`));
				name_vi = await translateText(name);
				officialName_vi = await translateText(officialName);
				console.log(chalk.green(`   → ${name_vi}`));
				await randomDelay();
			}

			translatedCountries.push({
				...country,
				name_vi,
				officialName_vi,
			});

			// Ghi ra file mỗi lượt
			fs.writeFileSync(
				OUTPUT_FILE,
				JSON.stringify(translatedCountries, null, 2),
				'utf-8'
			);
		} catch (err) {
			console.error(chalk.red(`❌ Lỗi dịch "${name}": ${err.message}`));
			translatedCountries.push({
				...country,
				name_vi: name,
				officialName_vi: officialName,
			});
		}
	}

	console.log(
		chalk.green(`\n✅ Hoàn tất dịch ${translatedCountries.length} quốc gia!`)
	);
	console.log(chalk.blue(`📁 File lưu tại: ${OUTPUT_FILE}`));
}

// === Run ===
await translateAll();
