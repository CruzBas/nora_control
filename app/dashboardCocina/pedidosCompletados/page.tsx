'use client';

import { useState } from 'react';
import MetricCard from '@/app/ui/MetricCard';

interface CompletedOrder {
    id: string;
    table: string;
    completedAt: string;
    itemsCount: number;
    items: string;
    chef: string;
}

const MOCK_COMPLETED: CompletedOrder[] = [
    { id: 'K-195', table: 'Mesa 4', completedAt: '09:45 AM', itemsCount: 3, items: 'Hamburguesa Nora, Papas, Refresco', chef: 'Roberto' },
    { id: 'K-196', table: 'Mesa 12', completedAt: '10:02 AM', itemsCount: 2, items: 'Pizza Pepperoni, Ensalada', chef: 'Maria' },
    { id: 'K-197', table: 'Llevar #42', completedAt: '10:15 AM', itemsCount: 1, items: 'Sándwich Club', chef: 'Roberto' },
    { id: 'K-198', table: 'Mesa 2', completedAt: '10:30 AM', itemsCount: 4, items: 'Tacos (3), Nachos, 2 Cervezas', chef: 'Maria' },
    { id: 'K-199', table: 'Mesa 8', completedAt: '10:55 AM', itemsCount: 2, items: 'Sopa de Mariscos, Arroz', chef: 'Roberto' },
    { id: 'K-200', table: 'Llevar #43', completedAt: '11:10 AM', itemsCount: 1, items: 'Ensalada César', chef: 'Maria' },
];

export default function PedidosCompletados() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredOrders = MOCK_COMPLETED.filter(order =>
        order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 p-6 md:p-8 space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight flex items-center gap-3">
                        Historial de Comandas
                        <span className="bg-nora-success/20 text-nora-success text-sm py-1 px-3 rounded-full border border-nora-success/30">
                            Hoy
                        </span>
                    </h1>
                    <p className="text-nora-gray-400 mt-1 font-medium italic">
                        Registro de órdenes finalizadas por el equipo de cocina.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-nora-gray-400 group-focus-within:text-nora-accent-400 transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar mesa o ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-nora-blue-800/80 border border-nora-blue-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-nora-accent-500/50 focus:ring-1 focus:ring-nora-accent-500/20 w-full sm:w-64 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-nora-blue-800/80 border border-nora-blue-700/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-nora-accent-500/50 w-full sm:w-auto appearance-none"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Hoy"
                    value={MOCK_COMPLETED.length.toString()}
                    icon="task_alt"
                    iconBgClass="bg-nora-success/10"
                    iconColorClass="text-nora-success"
                />
                <MetricCard
                    title="Promedio Prep."
                    value="12 min"
                    icon="timer"
                    iconBgClass="bg-nora-info/10"
                    iconColorClass="text-nora-info"
                />
            </div>

            {/* Orders Table */}
            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/40 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-nora-blue-900/40 border-b border-nora-blue-700">

                                <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">Mesa / Cliente</th>
                                <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">Contenido</th>
                                <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest text-center">Cant.</th>
                                <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">Finalizado</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nora-blue-700/30">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-nora-blue-600/10 transition-colors group">

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-nora-blue-700/50 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[18px] text-nora-gray-400">restaurant</span>
                                                </div>
                                                <span className="text-sm font-bold text-nora-gray-100">{order.table}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-nora-gray-400 line-clamp-1 max-w-xs">{order.items}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-md bg-nora-blue-700/30 text-nora-gray-300 text-xs font-bold">
                                                {order.itemsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-nora-gray-200 font-medium flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-nora-success"></span>
                                                {order.completedAt}
                                            </span>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <span className="material-symbols-outlined text-4xl">search_off</span>
                                            <p className="text-nora-gray-400 font-bold">No se encontraron órdenes</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-6 border-t border-nora-blue-700/40 flex justify-between items-center bg-nora-blue-900/20">
                    <p className="text-xs font-bold text-nora-gray-500 uppercase tracking-widest">Mostrando {filteredOrders.length} resultados</p>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-lg border border-nora-blue-700 flex items-center justify-center text-nora-gray-400 hover:bg-nora-blue-700 transition-colors">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-nora-blue-700 flex items-center justify-center text-nora-gray-400 hover:bg-nora-blue-700 transition-colors">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}