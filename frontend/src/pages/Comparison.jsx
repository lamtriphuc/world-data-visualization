import { useState } from "react";
import { FaX } from "react-icons/fa6";
import CompareTable from "../components/Tables/CompareTable";
import CompareChart from "../components/Charts/CompareChart";

const Comparison = () => {
  const countries = [
    { cca3: "VN", label: "Việt Nam" },
    { cca3: "US", label: "Mỹ" },
    { cca3: "JP", label: "Nhật Bản" },
    { cca3: "KR", label: "Hàn Quốc" },
    { cca3: "CN", label: "Trung Quốc" },
  ];

  const fakeCountries = [
    {
      cca3: "VN",
      name: { common: "Việt Nam", official: "Cộng hòa Xã hội Chủ nghĩa Việt Nam" },
      area: 331212,
      population: 98000000,
      region: "Asia",
      subregion: "South-Eastern Asia",
      capital: ["Hà Nội"],
      flags: { png: "https://flagcdn.com/w320/vn.png" },
    },
    {
      cca3: "US",
      name: { common: "Hoa Kỳ", official: "Hợp chủng quốc Hoa Kỳ" },
      area: 9833520,
      population: 331000000,
      region: "Americas",
      subregion: "North America",
      capital: ["Washington D.C."],
      flags: { png: "https://flagcdn.com/w320/us.png" },
    },
    {
      cca3: "JP",
      name: { common: "Nhật Bản", official: "Quốc gia Nhật Bản" },
      area: 377975,
      population: 125000000,
      region: "Asia",
      subregion: "Eastern Asia",
      capital: ["Tokyo"],
      flags: { png: "https://flagcdn.com/w320/jp.png" },
    },
  ];


  const [selectedCountries, setSelectedCountries] = useState([]);
  const maxCountries = 3;

  const handleAddCountry = (index, countryCode) => {
    const updated = [...selectedCountries];
    updated[index] = countryCode;
    setSelectedCountries(updated.slice(0, maxCountries));
  }


  const handleCompare = () => {

  }


  return (
    <>
      <div className="p-6 ">
        <div className="space-y-4  bg-white p-4  rounded-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Chọn quốc gia</h2>
            {selectedCountries.length > 0 && (
              <button className="flex items-center px-2 py-1 text-sm border border-gray-900 rounded-md text-gray-900 hover:bg-gray-100 hover:border-gray-500 transition cursor-pointer">
                <FaX className="w-4 h-4 mr-2" />
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Thẻ selêct */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            {Array.from({ length: maxCountries }).map((_, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-sm text-gray-600">
                  Quốc gia {index + 1}
                  {index === 0 && <span className="text-red-500 ml-1">*</span>}
                </label>

                <select
                  id={`country-${index}`}
                  value={selectedCountries[index] || ''}
                  onChange={e => handleAddCountry(index, e.target.value)}
                  disabled={index > 0 && !selectedCountries[index - 1]}
                  className={`border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 ${index > 0 && !selectedCountries[index - 1]
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "focus:ring-blue-500"
                    }`}
                >
                  <option value="">-- Chọn quốc gia --</option>
                  {countries.map(c => (
                    <option key={c.cca3} value={c.cca3}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-center p-4">
            <button
              className="p-2 rounded-md bg-blue-300 w-100"
              onClick={handleCompare}
            >So sánh</button>
          </div>



        </div>
        {/* compare table */}
        <div className='bg-white p-4 mt-4 rounded-sm'>
          <p className="text-center text-xl font-bold text-gray-600">Bảng so sánh</p>
          <CompareTable countries={fakeCountries} />
        </div>

        {/* compare chart */}
        <div className='bg-white p-4 mt-4 rounded-sm'>
          <p className="text-center text-xl font-bold text-gray-600">Biểu đồ so sánh</p>
          <CompareChart />
        </div>
      </div>
    </>
  )
}
export default Comparison