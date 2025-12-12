import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const histogramBins = {
    Population: [
        { label: "<10M", min: 0, max: 10_000_000 },
        { label: "10–50M", min: 10_000_000, max: 50_000_000 },
        { label: "50–100M", min: 50_000_000, max: 100_000_000 },
        { label: "100–300M", min: 100_000_000, max: 300_000_000 },
        { label: "300–500M", min: 300_000_000, max: 500_000_000 },
        { label: "500M+", min: 500_000_000, max: Infinity },
    ],
    Area: [
        { label: "<50k", min: 0, max: 50_000 },
        { label: "50k–200k", min: 50_000, max: 200_000 },
        { label: "200k–500k", min: 200_000, max: 500_000 },
        { label: "500k–1M", min: 500_000, max: 1_000_000 },
        { label: "1M–3M", min: 1_000_000, max: 3_000_000 },
        { label: "3M+", min: 3_000_000, max: Infinity },
    ],
    Density: [
        { label: "<50", min: 0, max: 50 },
        { label: "50–100", min: 50, max: 100 },
        { label: "100–200", min: 100, max: 200 },
        { label: "200–400", min: 200, max: 400 },
        { label: "400–800", min: 400, max: 800 },
        { label: "800+", min: 800, max: Infinity },
    ]
};

export default function Histogram({ countries = [], mode = "Population" }) {
    const bins = histogramBins[mode];

    // Tạo dữ liệu cho histogram
    const data = bins.map((bin) => {
        const count = countries.filter((c) => {
            const value =
                mode === "Population"
                    ? c.population?.value
                    : mode === "Area"
                        ? c.area
                        : c.density;

            return value >= bin.min && value < bin.max;
        }).length;

        return {
            range: bin.label, // dùng làm trục X (value ranges)
            count: count,      // dùng làm trục Y (số quốc gia)
        };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;

        return (
            <div
                style={{
                    background: "white",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    border: "1px solid #eee",
                    fontSize: 13
                }}
            >
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div>{payload[0].value} quốc gia</div>
            </div>
        );
    };

    return (
        <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    layout="vertical"
                >
                    <XAxis type="number" dataKey="count" />
                    <YAxis type="category" dataKey="range" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
