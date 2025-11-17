import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const BarChartComponent = ({ data, type }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h2 className="text-xl font-semibold mb-4">
                Top 10 Quốc gia theo {type === "population" ? "Dân số" : "Diện tích"}
            </h2>

            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-40} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip formatter={(v) => v.toLocaleString()} />
                    <Bar dataKey="value" fill="#3b82f6" isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartComponent;
