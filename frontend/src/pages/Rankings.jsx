import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TopCountriesTable from '../components/Tables/TopCountriesTable';
import TopLanguagesTable from '../components/Tables/TopLanguagesTable';
import TopBordersTable from '../components/Tables/TopBordersTable';
import {
	getTop10Area,
	getTop10Population,
	getTopLanguages,
	getTop10Borders,
} from '../services/country.service';
import Loading from '../components/Layout/Loading';

const Rankings = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);

	// Data states
	const [topPopulation, setTopPopulation] = useState([]);
	const [topArea, setTopArea] = useState([]);
	const [topLanguages, setTopLanguages] = useState([]);
	const [topBorders, setTopBorders] = useState([]);
	const [topListType, setTopListType] = useState('population');

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const [topAreaRes, topPopRes, topLangRes, topBordersRes] =
					await Promise.all([
						getTop10Area(),
						getTop10Population(),
						getTopLanguages(),
						getTop10Borders(),
					]);

				setTopArea(topAreaRes || []);
				setTopPopulation(topPopRes || []);
				setTopLanguages(topLangRes?.raw || []);
				setTopBorders(topBordersRes || []);
			} catch (error) {
				console.error('Error fetching ranking data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <Loading />;

	return (
		<div className='container mx-auto px-4 py-8 min-h-screen'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'>
					{t('global_rankings').includes('_')
						? 'Bảng Xếp Hạng & Thống Kê'
						: t('global_rankings')}
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-2'>
					{t('rankings_description') ||
						'Khám phá các quốc gia và ngôn ngữ hàng đầu thế giới qua các số liệu thống kê.'}
				</p>
			</div>

			{/* Row 1: Top Languages & Top Borders (Side by Side) */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
				<TopLanguagesTable languages={topLanguages} />
				<TopBordersTable countries={topBorders} />
			</div>

			{/* Row 2: Top Countries (Full Width) */}
			<div>
				<TopCountriesTable
					countries={topListType === 'population' ? topPopulation : topArea}
					type={topListType}
					topListType={topListType}
					onTopListTypeChange={setTopListType}
				/>
			</div>
		</div>
	);
};

export default Rankings;
