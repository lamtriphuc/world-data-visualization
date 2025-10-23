import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line, ResponsiveContainer, ComposedChart
} from "recharts";


const CompareChart = () => {
    const basicData = [
        { name: "Việt Nam", population: 98_000_000, area: 331_212 },
        { name: "Mỹ", population: 331_000_000, area: 833_520 },
        { name: "Nhật Bản", population: 125_000_000, area: 377_975 },
    ];

    const gdpData = [
        { year: 2015, VN: 200, US: 18200, JP: 4380 },
        { year: 2016, VN: 220, US: 18700, JP: 4930 },
        { year: 2017, VN: 245, US: 19400, JP: 4870 },
        { year: 2018, VN: 271, US: 20600, JP: 4970 },
        { year: 2019, VN: 282, US: 21400, JP: 5080 },
        { year: 2020, VN: 295, US: 20900, JP: 5050 },
        { year: 2021, VN: 340, US: 23100, JP: 4930 },
        { year: 2022, VN: 408, US: 25400, JP: 4230 },
        { year: 2023, VN: 430, US: 27000, JP: 4350 },
        { year: 2024, VN: 450, US: 28000, JP: 4400 },
    ];

    return (
        <div className="p-6 space-y-12 max-w-5xl mx-auto">
            {/* --- Biểu đồ dân số & diện tích --- */}
            <div className="mt-10">
                <h2 className="text-lg font-medium text-gray-700 mb-3">
                    Dân số & Diện tích (Biểu đồ kết hợp)
                </h2>

                <ResponsiveContainer width="100%" height={500}>
                    <ComposedChart
                        data={basicData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                            formatter={(v) => v.toLocaleString()}
                            labelFormatter={(label) => `Quốc gia: ${label}`}
                        />
                        <Legend />

                        {/* Dân số = cột */}
                        <Bar
                            yAxisId="left"
                            dataKey="population"
                            fill="#60a5fa"
                            name="Dân số"
                            barSize={50}
                        />

                        {/* Diện tích = đường */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="area"
                            stroke="#34d399"
                            strokeWidth={3}
                            name="Diện tích (km²)"
                            dot={{ r: 5 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* --- Biểu đồ GDP 10 năm --- */}
            <div>
                <h2 className="text-lg font-medium text-gray-700 mb-3">
                    GDP qua 10 năm (tỷ USD)
                </h2>
                <LineChart
                    width={1000}
                    height={500}
                    data={gdpData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(v) => v.toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="VN" stroke="#60a5fa" strokeWidth={2} name="Việt Nam" />
                    <Line type="monotone" dataKey="US" stroke="#34d399" strokeWidth={2} name="Mỹ" />
                    <Line type="monotone" dataKey="JP" stroke="#f472b6" strokeWidth={2} name="Nhật Bản" />
                </LineChart>
            </div>
        </div>
    );
}
export default CompareChart;