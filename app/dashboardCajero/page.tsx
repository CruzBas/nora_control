'use client';

import Link from 'next/link';
import MetricCard from '@/app/ui/MetricCard';

const OPEN_ORDERS = [
    { id: '101', client: 'Ana Martínez', total: '₡4,500', time: '10 min', items: '3 ítems', table: 'Mesa 4' },
    { id: '102', client: 'Carlos Ruiz', total: '₡12,800', time: '5 min', items: '5 ítems', table: 'Llevar' },
    { id: '103', client: 'Mesa 8', total: '₡8,200', time: '15 min', items: '2 ítems', table: 'Mesa 8' },
    { id: '104', client: 'Laura G.', total: '₡3,100', time: '2 min', items: '1 ítem', table: 'Mesa 2' },
    { id: '105', client: 'Roberto S.', total: '₡15,000', time: '20 min', items: '6 ítems', table: 'Llevar' },
    { id: '106', client: 'Mesa 12', total: '₡5,500', time: '8 min', items: '3 ítems', table: 'Mesa 12' },
];

export default function DashboardCajero() {
    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 group/dashboard">
            <div className="p-6 md:p-8 space-y-8">
                {/* Header Simplificado */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight flex items-center gap-3">
                            Ordenes Abiertas
                            <span className="bg-nora-accent-500/20 text-nora-accent-400 text-sm py-1 px-3 rounded-full border border-nora-accent-500/30">
                                {OPEN_ORDERS.length} activas
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
                    {OPEN_ORDERS.map((order) => (
                        <div key={order.id} className="cursor-pointer active:scale-95 transition-transform group/card">
                            <MetricCard
                                title={`${order.table} • ${order.items}`}
                                value={order.total}
                                icon="receipt_long"
                                badge={order.time}
                                badgeColorClass={
                                    parseInt(order.time) > 12
                                        ? 'bg-nora-danger/20 text-nora-danger border border-nora-danger/30'
                                        : 'bg-nora-accent-500/20 text-nora-accent-400 border border-nora-accent-500/30'
                                }
                                iconBgClass="bg-nora-blue-700/40"
                                iconColorClass="text-nora-gray-300 group-hover/card:text-nora-accent-400 transition-colors"
                                accentBorder={parseInt(order.time) > 12}
                                accentBorderClass="border-l-nora-danger"
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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nora-blue-800 border border-nora-blue-700/50 text-nora-gray-400 hover:text-nora-gray-100 transition-colors text-sm font-bold">
                        <span className="material-symbols-outlined text-lg">point_of_sale</span>
                        Cerrar Caja
                    </button>
                </div>
            </div>
        </div>
    );
}
