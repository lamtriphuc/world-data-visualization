import { useTranslation } from "react-i18next";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { getTranslatedName } from "../../ultils";

const COLORS = [
    "#3b82f6",
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
];

const PieChartComponent = ({ data, type, total }) => {
    const { t } = useTranslation();
    const currentLang = localStorage.getItem('lang');

    if (!data || data.length === 0 || !total) return null;

    // Tổng của 10 nước
    const top10Value = data.reduce((sum, item) => sum + item.value, 0);
    // Phần còn lại
    const otherValue = total - top10Value;

    const pieData = [...data];

    if (otherValue > 0) {
        pieData.push({
            name: currentLang === "vi" ? "Khác" : "Other",
            value: otherValue
        });
    }

    const formatTooltipValue = (value, name) => {
        if (value == null) return "";

        const countryName =
            currentLang === "vi" ? getTranslatedName(name) : name;

        // Đơn vị (theo type + ngôn ngữ)
        const unit =
            type === "population"
                ? currentLang === "vi"
                    ? "người"
                    : "people"
                : "km²";

        const percent = total ? ((value / total) * 100).toFixed(2) : 0;
        const formatted = value.toLocaleString(currentLang === "vi" ? "vi-VN" : "en-US");

        return [`${formatted} ${unit} (${percent}%)`, countryName];
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h2 className="text-xl font-semibold mb-4">
                {type === 'population' ? t('distribution_population') : t('distribution_area')}
            </h2>
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={120}
                        isAnimationActive={false}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip formatter={(v, name) => formatTooltipValue(v, name)} />
                    <Legend
                        formatter={(value) =>
                            currentLang === "vi" ? getTranslatedName(value) : value
                        }
                        labelFormatter={(label) =>
                            currentLang === "vi" ? getTranslatedName(label) : label
                        }
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartComponent;
