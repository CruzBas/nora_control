'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getVentasSemanaAction } from '@/lib/actions/ordenes.actions';

const PERIOD_OPTIONS = ['7 Días', '14 Días', '30 Días'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

const PERIOD_DAYS: Record<Period, number> = {
    '7 Días': 7,
    '14 Días': 14,
    '30 Días': 30,
};

const fmt = (v: number) =>
    v >= 1000 ? `₡${(v / 1000).toFixed(0)}k` : `₡${v.toLocaleString('es-CR')}`;

export default function SalesChart() {
    const [activePeriod, setActivePeriod] = useState<Period>('7 Días');
    const [data, setData] = useState<{ name: string; total: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getVentasSemanaAction(PERIOD_DAYS[activePeriod]).then(res => {
            if (res.success && res.data) setData(res.data);
            setLoading(false);
        });
    }, [activePeriod]);

    const totalPeriodo = data.reduce((s, d) => s + d.total, 0);

    return (
        <div className="bg-nora-blue-800/60 p-5 md:p-8 rounded-xl border border-nora-blue-700/40 shadow-[var(--nora-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h4 className="text-lg font-bold text-nora-gray-100">Evolución de Ventas</h4>
                    <p className="text-sm text-nora-gray-400 font-medium">
                        Total período:{' '}
                        <span className="text-nora-accent-400 font-black">
                            ₡{totalPeriodo.toLocaleString('es-CR', { minimumFractionDigits: 0 })}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-1 bg-nora-blue-700/40 p-1 rounded-lg">
                    {PERIOD_OPTIONS.map(period => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${activePeriod === period
                                ? 'bg-nora-accent-500 text-white shadow-sm'
                                : 'text-nora-gray-400 hover:text-nora-gray-200'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full h-56 sm:h-64 md:h-72">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-nora-accent-500" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.10)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickMargin={8}
                                minTickGap={20}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                width={55}
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={fmt}
                            />
                            <Tooltip
                                wrapperStyle={{ outline: 'none' }}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid rgba(100,116,139,0.3)',
                                    backgroundColor: '#1e293b',
                                    color: '#f1f5f9',
                                }}
                                formatter={(value: number | undefined) => [`₡${(value ?? 0).toLocaleString('es-CR')}`, 'Ventas']}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#d17a22"
                                strokeWidth={3}
                                dot={{ r: 3, fill: '#d17a22' }}
                                activeDot={{ r: 6, fill: '#d17a22' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
