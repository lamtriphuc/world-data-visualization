import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
// Giả sử bạn có hàm dịch tên ngôn ngữ, hoặc dùng lại getTranslatedName nếu nó hỗ trợ
import { getTranslatedName } from '../../ultils';

const LanguageBarChart = ({ data }) => {
    const { t } = useTranslation();
    const currentLang = localStorage.getItem('lang');

    // Formatter cho Tooltip
    const tooltipFormatter = (value) => {
        const unit = currentLang === 'vi' ? 'quốc gia' : 'countries';
        return [`${value} ${unit}`, t('countries_use') || 'Số lượng'];
    };

    // Formatter cho trục số (X-Axis)
    const formatXAxis = (value) => {
        // Chỉ hiện số nguyên, không cần rút gọn k/M vì số lượng quốc gia < 200
        return value;
    };

    return (
        <div className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow'>
            <h2 className='text-xl font-semibold mb-4'>
                {t('top10_languages_continent') || 'Top 10 Ngôn ngữ phổ biến'}
            </h2>

            <ResponsiveContainer width='100%' height={350}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray='3 3' horizontal={false} vertical={true} />

                    {/* Trục X bây giờ là trục giá trị (Số lượng) */}
                    <XAxis
                        type="number"
                        tickFormatter={formatXAxis}
                        tick={{ fill: 'var(--axis-color)' }}
                    />

                    {/* Trục Y bây giờ là trục Danh mục (Tên ngôn ngữ) */}
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100} // Tăng width để đủ chỗ cho tên ngôn ngữ dài
                        tick={{
                            fontSize: 12,
                            fill: 'var(--axis-color)',
                            fontWeight: 500
                        }}
                        tickFormatter={(name) =>
                            currentLang === 'vi' ? getTranslatedName(name) : name
                        }
                    />

                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={tooltipFormatter}
                        labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    />

                    {/* Thanh Bar */}
                    <Bar dataKey='value' fill='#3b82f6' radius={[0, 4, 4, 0]} barSize={20}>
                        {/* (Tùy chọn) Tô màu khác nhau cho top 3 */}
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index < 3 ? '#2563eb' : '#60a5fa'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LanguageBarChart;