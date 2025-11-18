import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoMdArrowBack } from 'react-icons/io';
import Dropdown from '../components/Layout/Dropdown';
import { LuChartArea, LuUsers } from 'react-icons/lu';
import StatCard from '../components/Cards/StatCard';
import BarChartComponent from '../components/Charts/BarChart';
import PieChartComponent from '../components/Charts/PieChart';
import { getAllCountriesContinent, getMax, getStats, getTop10Area, getTop10Population } from '../services/country.service';
import CountryCardContinent from '../components/Cards/CountryCardContient';
import translated from '../scripts/countries_translated.json';
import { useNavigate } from 'react-router-dom';
import { BiGlobe } from 'react-icons/bi';

// --- MOCK DATA ---
// const populationData = [
//     { name: "Russia", value: 146000000 },
//     { name: "Germany", value: 83000000 },
//     { name: "UK", value: 67000000 },
//     { name: "France", value: 65000000 },
//     { name: "Italy", value: 60000000 },
//     { name: "Spain", value: 47000000 },
//     { name: "Ukraine", value: 41000000 },
//     { name: "Poland", value: 38000000 },
//     { name: "Netherlands", value: 17000000 },
//     { name: "Belgium", value: 11000000 },
// ];

// const areaData = [
//     { name: "Russia", value: 17098242 },
//     { name: "Germany", value: 357022 },
//     { name: "UK", value: 243610 },
//     { name: "France", value: 640679 },
//     { name: "Italy", value: 301340 },
//     { name: "Spain", value: 505990 },
//     { name: "Ukraine", value: 603628 },
//     { name: "Poland", value: 312679 },
//     { name: "Netherlands", value: 41543 },
//     { name: "Belgium", value: 30528 },
// ];

const getTranslatedName = (name) => {
    const found = translated.find((c) => c.name === name);
    return found?.name_vi || name;
};

const Continent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentLang = localStorage.getItem('lang');
    const [region, setRegion] = useState("Asia");
    const [countries, setCountries] = useState([]);
    const [stats, setStats] = useState();
    const [maxArea, setMaxArea] = useState();
    const [maxPopulation, setMaxPopulation] = useState();
    const [topPopulation, setTopPopulaiton] = useState([]);
    const [topArea, setTopArea] = useState([]);
    const [mode, setMode] = useState("population");


    const regions = [
        { label: t('main_region.Asia'), value: "Asia" },
        { label: t('main_region.Europe'), value: "Europe" },
        { label: t('main_region.Africa'), value: "Africa" },
        { label: t('main_region.Americas'), value: "Americas" },
        { label: t('main_region.Oceania'), value: "Oceania" },
        { label: t('main_region.Antarctic'), value: "Antarctic" },
    ];

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await getAllCountriesContinent({
                    region: region,
                    sortOrder: 1,
                    limit: 150
                });
                setCountries(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchMax = async () => {
            try {
                const res = await getMax(region);
                setMaxArea(res.maxArea);
                setMaxPopulation(res.maxPopulation);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await getStats(region);
                setStats(res)
            } catch (err) {
                console.error(err);
            }
        };
        const fetchTop10Area = async () => {
            try {
                const res = await getTop10Area(region);
                const data = res.map(c => ({
                    name: c.name,
                    value: c.area
                }))
                setTopArea(data);
            } catch (error) {
                console.log('fetch top 10 area ', error);
            }
        };

        const fetchTop10Population = async () => {
            try {
                const res = await getTop10Population(region);
                const data = res.map(c => ({
                    name: c.name,
                    value: c.population.value
                }))
                setTopPopulaiton(data);
            } catch (error) {
                console.log('fetch top 10 populaiton ', error);
            }
        };

        fetchTop10Area();
        fetchTop10Population();

        fetchMax();
        fetchCountries();
        fetchStats();
    }, [region])

    const chartData = mode === "population" ? topPopulation : topArea;

    return (
        <div>
            <div className='flex justify-between'>
                <button
                    onClick={() => navigate('/')}
                    className='bg-white dark:bg-gray-800 px-3 py-1 rounded-md text-gray-500 dark:text-gray-400 flex items-center gap-3 cursor-pointer'>
                    <IoMdArrowBack />
                    {t('back')}
                </button>

                <Dropdown
                    label={regions.find(r => r.value === region)?.label}
                    items={regions.map(r => ({
                        label: r.label,
                        onClick: () => setRegion(r.value)
                    }))}
                />
            </div>
            <div className='my-4 grid grid-cols-1 md:grid-cols-3 gap-6'>
                <StatCard
                    title={t('total_country_continent')}
                    value={stats?.countryCount}
                    subtitle={t('countries')}
                    icon={BiGlobe}
                    bgColor={'bg-blue-100'}
                    iconColor={'text-blue-600'}
                />
                <StatCard
                    title={t('total_population_continent')}
                    value={stats?.totalPopulation}
                    subtitle={t('people')}
                    icon={LuUsers}
                    bgColor={'bg-green-100'}
                    iconColor={'text-green-600'}
                />
                <StatCard
                    title={t('total_area_continent')}
                    value={stats?.totalArea}
                    subtitle={'km²'}
                    icon={LuChartArea}
                    bgColor={'bg-purple-100'}
                    iconColor={'text-purple-600'}
                />
            </div>
            <div>
                <div className="py-6 space-y-4">
                    <div className='flex justify-end'>
                        <Dropdown
                            label={mode === "population" ? t('population') : t('area')}
                            items={[
                                { label: t('population'), onClick: () => setMode("population") },
                                { label: t('area'), onClick: () => setMode("area") },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BarChartComponent data={chartData} type={mode} />
                        <PieChartComponent data={chartData} type={mode} total={mode === "population" ? stats?.totalPopulation : stats?.totalArea} />
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-2 gap-6'>
                <div className='px-6 py-4 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer'>
                    <p className='text-gray-600 dark:text-gray-300 mb-2'>{t('text_most_populous')}</p>
                    <div className="flex">
                        <div className='w-25 text-7xl flex items-center justify-center mr-10'>{maxPopulation?.cca2}</div>
                        <div className='flex flex-col'>
                            <p className='text-gray-900 dark:text-white text-2xl font-medium'>
                                {currentLang === 'vi'
                                    ? getTranslatedName(maxPopulation?.name)
                                    : maxPopulation?.name
                                }
                            </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'> {t('population')}: {maxPopulation?.population.value} </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'> {t('area')}: {maxPopulation?.area} </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'> {t('capital')}: {maxPopulation?.capital[0]}  </p>
                        </div>
                        <div className='w-35 p-3 rounded-lg ml-auto'>
                            <img src={maxPopulation?.flag} alt={maxPopulation?.cca2} />
                        </div>
                    </div>
                </div>
                <div className='px-6 py-4 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer'>
                    <p className='text-gray-600 dark:text-gray-300 mb-2'>{t('text_largest_area')}</p>
                    <div className="flex">
                        <div className='w-25 text-7xl flex items-center justify-center mr-10'>{maxArea?.cca2}</div>
                        <div className='flex flex-col'>
                            <p className='text-gray-900 dark:text-white text-2xl font-medium'>
                                {currentLang === 'vi'
                                    ? getTranslatedName(maxArea?.name)
                                    : maxArea?.name}
                            </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'> {t('population')}: {maxArea?.population.value} </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'> {t('area')}: {maxArea?.area} </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'> {t('capital')}: {maxArea?.capital[0]}  </p>
                        </div>
                        <div className='w-35 p-3 rounded-lg ml-auto'>
                            <img src={maxArea?.flag} alt={maxArea?.cca2} />
                        </div>
                    </div>
                </div>

            </div>
            <div className="py-6 w-full">
                <h2 className="text-xl font-bold mb-4">Tất cả Quốc gia ({countries.length})</h2>
                <div className="grid grid-cols-4 gap-4">
                    {countries.map((country, index) => (
                        <CountryCardContinent
                            key={index}
                            country={country}
                            index={index}
                            onClick={() => navigate(`/country/${country.cca3}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Continent