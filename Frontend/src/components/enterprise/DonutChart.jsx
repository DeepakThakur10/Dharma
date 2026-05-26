import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#ff6b35', '#339af0', '#40c057', '#fa5252', '#fcc419', '#ae3ec9'];

export default function DonutChart({ data, title }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[var(--card)] rounded-2xl border border-[var(--border)] h-[300px]">
                <p className="text-[var(--text-muted)] text-sm">No data available for {title}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] h-[350px] flex flex-col">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{title}</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                color: 'var(--text)'
                            }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
