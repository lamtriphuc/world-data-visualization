import React, { useEffect, useState } from 'react'
import Dropdown from '../components/Layout/Dropdown';
import { getAllCountries } from '../services/country.service';
import Histogram from '../components/Charts/Histogram';

const Analytic = () => {
    const [metric, setMetric] = useState("Population");
    const [group, setGroup] = useState("World");
    const [contries, setCountries] = useState([]);

    const metricItems = [
        { label: "Dân số", value: 'Population', onClick: () => setMetric("Population") },
        { label: "Diện tích", value: 'Area', onClick: () => setMetric("Area") },
        { label: "Mật độ dân số", value: 'Density', onClick: () => setMetric("Density") },
    ];

    // const groupItems = [
    //     {
    //         label: "Châu Á",
    //         value: "Asia",
    //         children: [
    //             { label: "Central Asia", value: "Central Asia" },
    //             { label: "Eastern Asia", value: "Eastern Asia" },
    //             { label: "South-Eastern Asia", value: "South-Eastern Asia" },
    //             { label: "Southern Asia", value: "Southern Asia" },
    //             { label: "Western Asia", value: "Western Asia" },
    //         ],
    //     },
    //     {
    //         label: "Châu Âu",
    //         value: "Europe",
    //         children: [
    //             { label: "Northern Europe", value: "Northern Europe" },
    //             { label: "Southern Europe", value: "Southern Europe" },
    //             { label: "Eastern Europe", value: "Eastern Europe" },
    //             { label: "Western Europe", value: "Western Europe" },
    //         ],
    //     },
    //     {
    //         label: "Châu Phi",
    //         value: "Africa",
    //         children: [
    //             { label: "Northern Africa", value: "Northern Africa" },
    //             { label: "Western Africa", value: "Western Africa" },
    //             { label: "Middle Africa", value: "Middle Africa" },
    //             { label: "Eastern Africa", value: "Eastern Africa" },
    //             { label: "Southern Africa", value: "Southern Africa" },
    //         ],
    //     },
    //     {
    //         label: "Châu Mỹ",
    //         value: "Americas",
    //         children: [
    //             { label: "North America", value: "North America" },
    //             { label: "Central America", value: "Central America" },
    //             { label: "South America", value: "South America" },
    //             { label: "Caribbean", value: "Caribbean" },
    //         ],
    //     },
    //     {
    //         label: "Châu Đại Dương",
    //         value: "Oceania",
    //         children: [
    //             { label: "Australia and New Zealand", value: "Australia and New Zealand" },
    //             { label: "Melanesia", value: "Melanesia" },
    //             { label: "Micronesia", value: "Micronesia" },
    //             { label: "Polynesia", value: "Polynesia" },
    //         ],
    //     },
    //     {
    //         label: "Châu Nam Cực",
    //         value: "Antarctic",
    //         children: [], // Không có tiểu vùng
    //     },
    // ];

    const groupItems = [
        {
            label: "Thế giới",
            value: "World",
            children: [

            ],
        },
        {
            label: "Châu Á",
            value: "Asia",
            children: [

            ],
        },
        {
            label: "Châu Âu",
            value: "Europe",
            children: [

            ],
        },
        {
            label: "Châu Phi",
            value: "Africa",
            children: [

            ],
        },
        {
            label: "Châu Mỹ",
            value: "Americas",
            children: [

            ],
        },
        {
            label: "Châu Đại Dương",
            value: "Oceania",
            children: [

            ],
        },
    ];

    useEffect(() => {
        const fetchAllCountries = async () => {
            try {
                const res = await getAllCountries({ limit: 0, independent: true });
                setCountries(res.data);
            } catch (error) {
                console.log('fetchAllCountries ', error);
            }
        };

        fetchAllCountries();
    }, []);

    return (
        <div className="p-6 flex flex-col gap-6 w-full">
            <h1 className="text-2xl font-bold">Phân tích dữ liệu quốc gia</h1>
            <div className="flex gap-6">
                <div>
                    <p className="mb-2 font-medium">Chọn loại phân tích:</p>
                    <Dropdown label={metric} items={metricItems} onSelect={setMetric} />
                </div>
                <div>
                    <p className="mb-2 font-medium">Nhóm theo:</p>
                    <Dropdown label={group} items={groupItems} onSelect={setGroup} />
                </div>
            </div>


            <div className="mt-6 p-4 rounded-xl shadow bg-white dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-2">Kết quả hiển thị</h2>
                <div className="flex justify-end">

                    <Histogram countries={group == 'World' ? contries : contries.filter(c => c.region == group)} mode={metric} />
                </div>
            </div>
        </div>
    )
}

export default Analytic