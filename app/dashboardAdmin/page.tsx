'use client';

import MetricCard from '../ui/MetricCard';
import SalesChart from '../ui/SalesChart';
import TransactionsTable from '../ui/TransactionsTable';
import { useOrders, useInventory } from '@/app/lib/hooks';

export default function DashboardAdminPage() {
    const { orders, loading: ordersLoading } = useOrders();
    const { ingredients, loading: inventoryLoading } = useInventory();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(amount);
    };

    const totalSalesToday = orders.reduce((acc, order) => acc + order.total, 0);
    const activeOrdersCount = orders.length;
    const stockAlertsCount = ingredients.filter(i => i.stock <= i.min).length;

    if (ordersLoading || inventoryLoading) {
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
                        Bienvenida de nuevo. Esto es lo que sucede hoy.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <MetricCard
                        title="Ventas de Hoy"
                        value={formatCurrency(totalSalesToday)}
                        icon="payments"
                        iconColorClass="text-nora-success"
                        iconBgClass="bg-nora-success/10"
                        badge="+calculando..."
                        badgeColorClass="text-nora-success bg-nora-success/10"
                    />
                    <MetricCard
                        title="Facturas Activas"
                        value={activeOrdersCount.toString()}
                        icon="description"
                        iconColorClass="text-nora-info"
                        iconBgClass="bg-nora-info/10"
                    />
                    <MetricCard
                        title="Alertas de Stock"
                        value={stockAlertsCount.toString()}
                        icon="warning"
                        iconColorClass="text-nora-danger"
                        iconBgClass="bg-nora-danger/10"
                        badge={stockAlertsCount > 0 ? "Prioridad" : "OK"}
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
