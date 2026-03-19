'use client';

import { useState, useEffect } from 'react';
import MetricCard from '../ui/MetricCard';
import SalesChart from '../ui/SalesChart';
import TransactionsTable from '../ui/TransactionsTable';
import { useInventory } from '@/app/lib/hooks';
import { getDashboardStatsAction } from '@/lib/actions/ordenes.actions';

export default function HomeMaster() {
    const { ingredients, loading: inventoryLoading } = useInventory();
    const [stats, setStats] = useState<{ ventasHoy: number; ordenesActivas: number; ventasAyer: number } | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = () => {
            getDashboardStatsAction().then(res => {
                if (res.success && res.data) setStats(res.data);
                setStatsLoading(false);
            });
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const stockAlertsCount = ingredients.filter(i => i.cantidad <= i.minimo).length;
    const fmt = (n: number) => `₡${n.toLocaleString('es-CR', { minimumFractionDigits: 0 })}`;

    const variacion = stats
        ? stats.ventasAyer > 0
            ? (((stats.ventasHoy - stats.ventasAyer) / stats.ventasAyer) * 100).toFixed(1)
            : stats.ventasHoy > 0 ? '+100' : '0'
        : null;

    const variacionPrefix = variacion !== null && !variacion.startsWith('-') ? '+' : '';

    if (statsLoading || inventoryLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-nora-blue-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl md:text-3xl font-black text-nora-gray-100 tracking-tight leading-tight">
                        Resumen de Negocio
                    </h3>
                    <p className="text-nora-gray-400 font-medium text-sm md:text-base">
                        {new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <MetricCard
                        title="Ventas de Hoy"
                        value={fmt(stats?.ventasHoy ?? 0)}
                        icon="payments"
                        iconColorClass="text-nora-success"
                        iconBgClass="bg-nora-success/10"
                        badge={variacion !== null ? `${variacionPrefix}${variacion}% vs ayer` : undefined}
                        badgeColorClass={
                            variacion !== null && !variacion.startsWith('-')
                                ? 'text-nora-success bg-nora-success/10'
                                : 'text-nora-danger bg-nora-danger/10'
                        }
                    />
                    <MetricCard
                        title="Órdenes Activas"
                        value={(stats?.ordenesActivas ?? 0).toString()}
                        icon="receipt_long"
                        iconColorClass="text-nora-info"
                        iconBgClass="bg-nora-info/10"
                        badge={(stats?.ordenesActivas ?? 0) > 0 ? 'En curso' : undefined}
                        badgeColorClass="text-nora-info bg-nora-info/10"
                    />
                    <MetricCard
                        title="Alertas de Stock"
                        value={stockAlertsCount.toString()}
                        icon="warning"
                        iconColorClass={stockAlertsCount > 0 ? 'text-nora-danger' : 'text-nora-success'}
                        iconBgClass={stockAlertsCount > 0 ? 'bg-nora-danger/10' : 'bg-nora-success/10'}
                        badge={stockAlertsCount > 0 ? 'Revisar' : 'OK'}
                        badgeColorClass={
                            stockAlertsCount > 0
                                ? 'text-nora-danger bg-nora-danger/10'
                                : 'text-nora-success bg-nora-success/10'
                        }
                    />
                </div>

                <SalesChart />
                <TransactionsTable />
            </div>

            <footer className="px-4 md:px-8 py-6 border-t border-nora-blue-700/40 text-center">
                <p className="text-xs text-nora-gray-500 font-medium">
                    © 2026 Nora Control System. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    );
}
