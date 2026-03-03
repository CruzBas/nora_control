'use client';

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

interface ChartData {
    name: string;
    value: number;
}

interface ReportsRevenueChartProps {
    data?: ChartData[];
    title?: string;
}

const COLORS = ['#D17A22', '#3A6399', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6'];

export default function ReportsRevenueChart({
    data = [
        { name: 'Producto A', value: 400 },
        { name: 'Producto B', value: 300 },
        { name: 'Producto C', value: 200 },
        { name: 'Producto D', value: 278 },
    ],
    title = 'Análisis Gráfico (Ingresos)'
}: ReportsRevenueChartProps) {
    return (
        <div className="bg-nora-blue-800/40 p-6 rounded-3xl border border-nora-blue-700/30 shadow-sm backdrop-blur-sm">
            <h2 className="text-lg font-black text-nora-gray-100 tracking-tight mb-6">{title}</h2>
            <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                                backgroundColor: '#162D4A',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#F1F5F9'
                            }}
                            itemStyle={{ color: '#F1F5F9' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
