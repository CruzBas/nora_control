'use client';

import { useState, useEffect } from 'react';
import ReportsHeader from '@/app/ui/reportes/ReportsHeader';
import ReportsDateFilter from '@/app/ui/reportes/ReportsDateFilter';
import ReportsKpis from '@/app/ui/reportes/ReportsKpis';
import ReportsTopProducts from '@/app/ui/reportes/ReportsTopProducts';
import ReportsRevenueChart from '@/app/ui/reportes/ReportsRevenueChart';
import { getReporteAction } from '@/lib/actions/ordenes.actions';

interface ReportData {
    kpis: { revenue: number, salesCount: number, avgTicket: number };
    topProducts: { name: string, quantity: number, revenue: number }[];
    chartData: { name: string, value: number }[];
}

export default function ReportesClient() {
    // Default to the last 7 days including today
    const [dateStart, setDateStart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [dateEnd, setDateEnd] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async (start: string, end: string) => {
        setLoading(true);
        try {
            const res = await getReporteAction(start, end);
            if (res.success && res.data) {
                setData(res.data);
            } else {
                console.error(res.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(dateStart, dateEnd);
    }, []);

    const handleFilter = (start: string, end: string) => {
        setDateStart(start);
        setDateEnd(end);
        loadData(start, end);
    };

    const handleExport = () => {
        if (!data) return;

        const csvRows = [];
        // Header
        csvRows.push(`Reporte de Ventas NORA CONTROL`);
        csvRows.push(`Periodo:,${dateStart},a,${dateEnd}`);
        csvRows.push(''); // Empty line

        // KPIs
        csvRows.push(`Ingresos Totales (Colones),Ventas Realizadas,Ticket Promedio (Colones)`);
        csvRows.push(`${data.kpis.revenue},${data.kpis.salesCount},${data.kpis.avgTicket.toFixed(2)}`);
        csvRows.push(''); // Empty line

        // Top Productos
        csvRows.push('Top Productos');
        csvRows.push('Nombre del Producto,Cantidad Vendida,Ingresos Generados (Colones)');
        data.topProducts.forEach(p => {
            csvRows.push(`"${p.name}",${p.quantity},${p.revenue}`);
        });
        csvRows.push(''); // Empty line

        // Ventas por día
        csvRows.push('Ventas por dia');
        csvRows.push('Dia,Ingresos Generados (Colones)');
        data.chartData.forEach(c => {
            csvRows.push(`"${c.name}",${c.value}`);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_ventas_${dateStart}_${dateEnd}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fmt = (val: number) => '₡' + val.toLocaleString('es-CR', { minimumFractionDigits: 2 });

    return (
        <div className="flex flex-col min-h-full bg-nora-blue-900 text-nora-gray-100">
            <ReportsHeader title="Reportes Generales" />

            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full">
                        <ReportsDateFilter
                            initialStart={dateStart}
                            initialEnd={dateEnd}
                            onFilter={handleFilter}
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={loading || !data}
                        className="w-full md:w-auto px-6 py-4 bg-nora-success hover:bg-nora-success/90 text-white font-bold rounded-2xl shadow-lg shadow-nora-success/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 md:h-[88px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">download</span>
                        Exportar CSV
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500"></div>
                    </div>
                ) : data ? (
                    <>
                        <ReportsKpis
                            revenue={fmt(data.kpis.revenue)}
                            salesCount={String(data.kpis.salesCount)}
                            avgTicket={fmt(data.kpis.avgTicket)}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ReportsTopProducts
                                products={data.topProducts.map(p => ({
                                    name: p.name,
                                    quantity: p.quantity,
                                    revenue: fmt(p.revenue)
                                }))}
                            />
                            <ReportsRevenueChart
                                title="Análisis de Ventas"
                                data={data.chartData}
                            />
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 text-nora-gray-400">
                        Error al cargar los datos del reporte.
                    </div>
                )}
            </main>
        </div>
    );
}
