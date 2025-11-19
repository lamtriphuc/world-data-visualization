import React from 'react'
import { useTranslation } from 'react-i18next';
import translated from '../../scripts/countries_translated.json';

const getTranslatedName = (name) => {
    const found = translated.find((c) => c.name === name);
    return found?.name_vi || name;
};

const CountryCardContient = ({ country, index, onClick }) => {
    const { id, name, population, flag } = country;
    const { t } = useTranslation();
    const currentLang = localStorage.getItem('lang');

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg shadow-md w-full sm:w-[300px] cursor-pointer">
            <div className="text-sm text-gray-500">#{index + 1}</div>
            <div className="w-14 min-w-12 h-12">
                <img src={flag} className="w-full h-full object-cover rounded" />
            </div>
            <div>
                <div className="font-bold text-lg">
                    {currentLang === 'vi'
                        ? getTranslatedName(name)
                        : name
                    }
                </div>
                <div className="text-gray-500">{t('population')}: {population.value.toLocaleString()}</div>
            </div>
        </div>
    )
}

export default CountryCardContient