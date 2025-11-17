import React from 'react'

const CountryCardContient = ({ country }) => {
    const { id, name, population, flag } = country;

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md w-full sm:w-[250px]">
            <div className="w-12 h-12">
                <img src={flag} className="w-full h-full object-cover rounded" />
            </div>
            <div>
                <div className="text-sm text-gray-500">#{id}</div>
                <div className="font-bold text-lg">{name}</div>
                <div className="text-gray-500">{population.toLocaleString()}</div>
            </div>
        </div>
    )
}

export default CountryCardContient