'use client';

import { useState, useEffect } from 'react';

interface ReportsDateFilterProps {
    initialStart?: string;
    initialEnd?: string;
    onFilter?: (start: string, end: string) => void;
}

export default function ReportsDateFilter({
    initialStart = '',
    initialEnd = '',
    onFilter
}: ReportsDateFilterProps) {
    const [dateStart, setDateStart] = useState(initialStart);
    const [dateEnd, setDateEnd] = useState(initialEnd);

    useEffect(() => {
        setDateStart(initialStart);
        setDateEnd(initialEnd);
    }, [initialStart, initialEnd]);

    const handleGenerateReport = () => {
        if (onFilter) onFilter(dateStart, dateEnd);
    };

    return (
        <div className="bg-nora-blue-800/40 p-6 rounded-2xl border border-nora-blue-700/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
                <div className="bg-nora-accent-500/20 p-3 rounded-xl text-nora-accent-400">
                    <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-nora-gray-100">Filtro de Fechas</h3>
                    <p className="text-xs text-nora-gray-400">Selecciona el periodo a consultar</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="w-full sm:w-auto p-3 text-sm bg-nora-blue-900 border border-nora-blue-600 rounded-xl outline-none focus:ring-2 focus:ring-nora-accent-500 transition-all font-medium text-nora-gray-200 color-scheme-dark"
                />
                <span className="text-nora-gray-400 font-bold hidden sm:block">a</span>
                <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="w-full sm:w-auto p-3 text-sm bg-nora-blue-900 border border-nora-blue-600 rounded-xl outline-none focus:ring-2 focus:ring-nora-accent-500 transition-all font-medium text-nora-gray-200 color-scheme-dark"
                />
                <button
                    onClick={handleGenerateReport}
                    className="w-full sm:w-auto px-6 py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-bold rounded-xl shadow-lg shadow-nora-accent-500/20 active:scale-95 transition-all text-sm cursor-pointer"
                >
                    Generar Reporte
                </button>
            </div>
        </div>
    );
}
