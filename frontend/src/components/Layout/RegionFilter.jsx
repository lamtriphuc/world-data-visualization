// src/components/RegionFilter.jsx
import React from 'react';

const RegionFilter = ({ regions, selectedRegion, onFilterChange }) => {
    const allRegions = ['All', ...regions];

    return (
        <div className="flex flex-wrap gap-2 p-2 bg-white rounded-md shadow-md z-20">
            {allRegions.map((region) => {
                const isSelected = region === selectedRegion;
                return (
                    <button
                        key={region}
                        onClick={() => onFilterChange(region)}
                        className={`
              px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${isSelected
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
            `}
                    >
                        {region}
                    </button>
                );
            })}
        </div>
    );
}

export default RegionFilter;