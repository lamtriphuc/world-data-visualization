import React from "react";

const CompareTable = ({ countries }) => {
    const fields = [
        { key: "name.common", label: "Tên quốc gia" },
        { key: "name.official", label: "Tên chính thức" },
        { key: "area", label: "Diện tích (km²)" },
        { key: "population", label: "Dân số" },
        { key: "region", label: "Khu vực" },
        { key: "subregion", label: "Tiểu vùng" },
        { key: "capital", label: "Thủ đô" },
    ];

    const getValue = (obj, path) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj) ?? "—";
    };


    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-300 rounded-md text-sm">
                <thead className="bg-gray-100 text-gray-800">
                    <tr>
                        <th className="p-3 text-left border-b border-gray-300">Thuộc tính</th>
                        {countries.map((c) => (
                            <th key={c.cca3} className="p-3 text-left border-b border-gray-300">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={c.flags?.png}
                                        alt={c.name?.common}
                                        className="w-6 h-4 object-cover border"
                                    />
                                    {c.name?.common}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {fields.map((field) => (
                        <tr key={field.key} className="odd:bg-white even:bg-gray-50">
                            <td className="p-3 font-medium text-gray-700 border-b border-gray-200">
                                {field.label}
                            </td>
                            {countries.map((c) => (
                                <td key={c.cca3 + field.key} className="p-3 border-b border-gray-200">
                                    {getValue(c, field.key)?.toLocaleString?.() || getValue(c, field.key)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default CompareTable;