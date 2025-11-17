import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoMdArrowBack } from 'react-icons/io';
import Dropdown from '../components/Layout/Dropdown';
import { LuUsers } from 'react-icons/lu';
import StatCard from '../components/Cards/StatCard';
import BarChartComponent from '../components/Charts/BarChart';
import PieChartComponent from '../components/Charts/PieChart';

// --- MOCK DATA ---
const populationData = [
    { name: "Russia", value: 146000000 },
    { name: "Germany", value: 83000000 },
    { name: "UK", value: 67000000 },
    { name: "France", value: 65000000 },
    { name: "Italy", value: 60000000 },
    { name: "Spain", value: 47000000 },
    { name: "Ukraine", value: 41000000 },
    { name: "Poland", value: 38000000 },
    { name: "Netherlands", value: 17000000 },
    { name: "Belgium", value: 11000000 },
];

const areaData = [
    { name: "Russia", value: 17098242 },
    { name: "Germany", value: 357022 },
    { name: "UK", value: 243610 },
    { name: "France", value: 640679 },
    { name: "Italy", value: 301340 },
    { name: "Spain", value: 505990 },
    { name: "Ukraine", value: 603628 },
    { name: "Poland", value: 312679 },
    { name: "Netherlands", value: 41543 },
    { name: "Belgium", value: 30528 },
];

const Continent = () => {
    const { t } = useTranslation();

    const menuItems = [
        { label: "Profile", onClick: () => console.log("Profile clicked") },
        { label: "Settings", onClick: () => console.log("Settings clicked") },
        { label: "Logout", onClick: () => console.log("Logout clicked") },
    ];

    const [mode, setMode] = useState("population");
    const chartData = mode === "population" ? populationData : areaData;

    return (
        <div>
            <div className='flex justify-between'>
                <button className='bg-white dark:bg-gray-800 px-3 py-1 rounded-md text-gray-500 dark:text-gray-400 flex items-center gap-3'>
                    <IoMdArrowBack />
                    {t('back')}
                </button>

                <Dropdown label="Options" items={menuItems} />
            </div>
            <div className='my-4 grid grid-cols-1 md:grid-cols-3 gap-6'>
                <StatCard
                    title={t('total_population')}
                    value={2}
                    subtitle={t('people')}
                    icon={LuUsers}
                    bgColor={'bg-green-100'}
                    iconColor={'text-green-600'}
                />
                <StatCard
                    title={t('total_population')}
                    value={2}
                    subtitle={t('people')}
                    icon={LuUsers}
                    bgColor={'bg-green-100'}
                    iconColor={'text-green-600'}
                />
                <StatCard
                    title={t('total_population')}
                    value={2}
                    subtitle={t('people')}
                    icon={LuUsers}
                    bgColor={'bg-green-100'}
                    iconColor={'text-green-600'}
                />
            </div>
            <div>
                <div className="py-6 space-y-4">
                    <div className='flex justify-end'>
                        <Dropdown
                            label={mode === "population" ? "Dân số" : "Diện tích"}
                            items={[
                                { label: "Dân số", onClick: () => setMode("population") },
                                { label: "Diện tích", onClick: () => setMode("area") },
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BarChartComponent data={chartData} />
                        <PieChartComponent data={chartData} />
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-2 gap-6'>
                <div className='p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer'>
                    <p className='text-gray-600 dark:text-gray-300 mb-2'>Quốc gia đông dân nhất</p>
                    <div className="flex">
                        <div className='flex flex-col'>
                            <p className='text-gray-900 dark:text-white text-2xl font-medium'>
                                Nga
                            </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
                                Dân số: 20000
                            </p>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
                                Thủ đô: mowcow
                            </p>
                        </div>
                        <div className=' p-3 rounded-lg'>
                            Cờ
                        </div>
                    </div>
                </div>

                <div className='p-6 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow rounded-xl cursor-pointer'>
                    <div className='flex flex-wrap items-center justify-between'>
                        <div>
                            <p className='text-gray-600 dark:text-gray-300 mb-2'>Quốc gia đông dân nhất</p>
                            <div className='flex gap-2'>
                                <p className='text-gray-900 dark:text-white text-2xl font-medium'>
                                    Nga
                                </p>
                                <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
                                    Dân số: 20000
                                </p>
                                <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
                                    Thủ đô: mowcow
                                </p>
                            </div>
                        </div>
                        <div className=' p-3 rounded-lg'>
                            Cờ
                        </div>
                    </div>
                </div>

                {/* <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Tất cả Quốc gia ({countries.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {countries.map((country) => (
                            <CountryCard key={country.id} country={country} />
                        ))}
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default Continent