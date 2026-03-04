'use client';

import Link from 'next/link';
import MetricCard from '@/app/ui/MetricCard';
import { useOrders } from '@/app/lib/hooks';

export default function DashboardCajero() {
    const { orders, loading, error } = useOrders();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-nora-blue-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-nora-blue-900 p-4 text-center">
                <span className="material-symbols-outlined text-6xl text-nora-danger mb-4">error</span>
                <h2 className="text-2xl font-bold text-white mb-2">Error al cargar órdenes</h2>
                <p className="text-nora-gray-400 mb-6">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 group/dashboard">
            <div className="p-6 md:p-8 space-y-8">
                {/* Header Simplificado */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight flex items-center gap-3">
                            Ordenes Abiertas
                            <span className="bg-nora-accent-500/20 text-nora-accent-400 text-sm py-1 px-3 rounded-full border border-nora-accent-500/30">
                                {orders.length} activas
                            </span>
                        </h1>
                        <p className="text-nora-gray-400 mt-1 font-medium italic">
                            Gestiona y finaliza las ventas en curso.
                        </p>
                    </div>

                    <Link
                        href="/dashboardCajero/ventas"
                        className="flex items-center justify-center gap-2 bg-nora-accent-500 hover:bg-nora-accent-400 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-nora-accent-500/25 active:scale-95"
                    >
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                        NUEVA ORDEN
                    </Link>
                </div>

                {/* Sección de Ordenes Abiertas utilizando MetricCards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {orders.map((order) => (
                        <div key={order.id} className="cursor-pointer active:scale-95 transition-transform group/card">
                            <MetricCard
                                title={`${order.table} • ${order.items.length} ítems`}
                                value={formatCurrency(order.total)}
                                icon="receipt_long"
                                badge={order.time}
                                badgeColorClass="bg-nora-accent-500/20 text-nora-accent-400 border border-nora-accent-500/30"
                                iconBgClass="bg-nora-blue-700/40"
                                iconColorClass="text-nora-gray-300 group-hover/card:text-nora-accent-400 transition-colors"
                            />
                        </div>
                    ))}

                    {/* Placeholder para agregar nueva */}
                    <Link
                        href="/dashboardCajero/ventas"
                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-nora-blue-700/50 hover:border-nora-accent-500/50 hover:bg-nora-accent-500/5 transition-all group"
                    >
                        <span className="material-symbols-outlined text-4xl text-nora-blue-700 group-hover:text-nora-accent-500 mb-2 transition-colors">add_circle</span>
                        <span className="text-sm font-bold text-nora-blue-700 group-hover:text-nora-accent-500 transition-colors">Crear Orden</span>
                    </Link>
                </div>

                {/* Acceso Rápido Inferior */}
                <div className="pt-8 border-t border-nora-blue-800 flex flex-wrap gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nora-blue-800 border border-nora-blue-700/50 text-nora-gray-400 hover:text-nora-gray-100 transition-colors text-sm font-bold">
                        <span className="material-symbols-outlined text-lg">history</span>
                        Historial del Turno
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nora-blue-800 border border-nora-blue-700/50 text-nora-gray-400 hover:text-gray-100 transition-colors text-sm font-bold">
                        <span className="material-symbols-outlined text-lg">point_of_sale</span>
                        Cerrar Caja
                    </button>
                </div>
            </div>
        </div>
    );
}
