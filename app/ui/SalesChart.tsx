'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const PERIOD_OPTIONS = ['7 Días', '30 Días', 'Histórico'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

export default function SalesChart() {
    const [activePeriod, setActivePeriod] = useState<Period>('7 Días');
    const data = [
        { name: 'Producto 1', cantidad: 1 },
        { name: 'Producto 2', cantidad: 10 },
        { name: 'Producto 3', cantidad: 2 },

    ];
    return (
        <div className="bg-nora-blue-800/60 p-5 md:p-8 rounded-xl border border-nora-blue-700/40 shadow-[var(--nora-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h4 className="text-lg font-bold text-nora-gray-100">
                        Evolución de Beneficios
                    </h4>
                    <p className="text-sm text-nora-gray-400 font-medium">
                        Ingresos netos comparados con el período anterior
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-nora-blue-700/40 p-1 rounded-lg">
                    {PERIOD_OPTIONS.map((period) => (
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
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(148,163,184,0.15)"
                        />

                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            tickMargin={8}
                            minTickGap={20}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            width={35}
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            wrapperStyle={{ outline: "none" }}
                            contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "var(--nora-blue-800)",

                            }}
                        />

                        <Line
                            type="monotone"
                            dataKey="cantidad"
                            stroke="#7974e0"
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
