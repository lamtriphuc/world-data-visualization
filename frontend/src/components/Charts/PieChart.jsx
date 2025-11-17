import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const COLORS = [
    "#3b82f6",
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
];

const PieChartComponent = ({ data }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
            <h2 className="text-xl font-semibold mb-4">Phân bố</h2>

            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={110}
                        isAnimationActive={false}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>

                    <Tooltip formatter={(v) => v.toLocaleString()} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartComponent;
