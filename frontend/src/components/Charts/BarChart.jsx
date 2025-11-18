import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { useTranslation } from "react-i18next";
import { getTranslatedName } from "../../ultils";

const BarChartComponent = ({ data, type }) => {
    const { t } = useTranslation();
    const currentLang = localStorage.getItem('lang');

    const tooltipFormatter = (value) => {
        const label = t('value');
        return [`${value.toLocaleString()}`, label];
    };

    const formatValue = (value, type = "population") => {
        if (type === "population") {
            // Dân số
            if (value >= 1_000_000_000) return currentLang === "vi"
                ? (value / 1_000_000_000).toFixed(2) + " tỷ"
                : (value / 1_000_000_000).toFixed(2) + "B";
            if (value >= 1_000_000) return currentLang === "vi"
                ? (value / 1_000_000).toFixed(1) + " triệu"
                : (value / 1_000_000).toFixed(1) + "M";
            if (value >= 1_000) return currentLang === "vi"
                ? (value / 1_000).toFixed(0) + " nghìn"
                : (value / 1_000).toFixed(0) + "k";
            return value;
        } else if (type === "area") {
            // Diện tích
            if (value >= 1_000_000) return currentLang === "vi"
                ? (value / 1_000_000).toFixed(1) + " triệu km²"
                : (value / 1_000_000).toFixed(1) + "M km²";
            if (value >= 1_000) return currentLang === "vi"
                ? (value / 1_000).toFixed(0) + " nghìn km²"
                : (value / 1_000).toFixed(0) + "k km²";
            return value + " km²";
        }
        return value;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h2 className="text-xl font-semibold mb-4">
                {type === "population" ? t('top10_population_continent') : t('top10_area_continent')}
            </h2>

            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        angle={-40}
                        textAnchor="end"
                        height={80}
                        tickFormatter={name => currentLang === 'vi' ? getTranslatedName(name) : name}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatValue(value, type)}
                    />
                    <Tooltip formatter={tooltipFormatter} />
                    <Bar dataKey="value" fill="#3b82f6" isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartComponent;
