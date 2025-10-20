import React from 'react'
import { FiMapPin } from 'react-icons/fi'
import { GoTrophy } from 'react-icons/go';
import { LuUsers } from 'react-icons/lu'

const TopCountriesTable = ({ countries, title, type }) => {

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const formatArea = (area) => {
        return `${formatNumber(area)} km²`;
    };

    const formatPopulation = (pop) => {
        if (pop >= 1_000_000_000) {
            return `${(pop / 1_000_000_000).toFixed(2)} bilion`;
        } else if (pop >= 1_000_000) {
            return `${(pop / 1_000_000).toFixed(2)} milion`;
        }
        return formatNumber(pop);
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-700';
        if (rank === 2) return 'bg-gray-100 text-gray-700';
        if (rank === 3) return 'bg-orange-100 text-orange-700';
        return 'bg-blue-50 text-blue-700';
    };

    const getRankIcon = (rank) => {
        if (rank <= 3) {
            return <GoTrophy className="w-4 h-4" />;
        }
        return null;
    };


    return (
        <div className='mt-6 p-6 bg-white shadow-lg rounded-xl'>
            <div className='flex items-center gap-2 mb-4'>
                {type === 'population' ? (
                    <LuUsers className="w-5 h-5 text-blue-600" />
                ) : (
                    <FiMapPin className="w-5 h-5 text-green-600" />
                )}
                <h2 className="text-gray-900">{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className='table-auto text-left w-full border-collapse'>
                    <thead className='text-sm'>
                        <tr>
                            <th className='w-16 pb-2'>Ranking</th>
                            <th className='w-16 pb-2'>Flag</th>
                            <th className='w-50 pb-2'>Country</th>
                            <th className='w-20 pb-2'>Region</th>
                            <th className='w-40 pb-2 text-right'>
                                {type === 'population' ? 'Population' : 'Area'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {countries.map((country, index) => (
                            <tr key={country.cca3} className='border-t border-gray-200 hover:bg-gray-50 transition-colors'>
                                <td className='py-2'>
                                    <div className={`flex items-center justify-center gap-1 w-10 h-10 rounded-lg ${getRankColor(index + 1)}`}>
                                        {getRankIcon(index + 1)}
                                        <span>{index + 1}</span>
                                    </div>
                                </td>
                                <td>
                                    <img
                                        src={country.flags.svg}
                                        alt={`Cờ ${country.name.common}`}
                                        className="w-12 h-8 object-cover rounded border border-gray-200"
                                    />
                                </td>
                                <td>
                                    <div>
                                        <p className="text-gray-900">{country.name.common}</p>
                                        <p className="text-gray-500 text-sm">{country.cca3}</p>
                                    </div>
                                </td>
                                <td>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                        {country.region}
                                    </span>
                                </td>
                                <td>
                                    <div className='text-right'>
                                        <p className="text-gray-900">
                                            {type === 'population'
                                                ? formatPopulation(country.population)
                                                : formatArea(country.area)}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {type === 'population'
                                                ? formatNumber(country.population)
                                                : formatNumber(country.area) + ' km²'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TopCountriesTable