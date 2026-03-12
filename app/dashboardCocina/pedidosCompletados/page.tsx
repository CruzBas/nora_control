'use client';

import { useState } from 'react';
import MetricCard from '@/app/ui/MetricCard';
import { useHistorialOrdenes } from '@/app/lib/useHistorialOrdenes';

export default function PedidosCompletados() {
    const { ordenes, loading, error, refresh } = useHistorialOrdenes();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredOrders = ordenes.filter(order =>
        order.cliente_nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.items ?? []).some(item => item.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    value={ordenes.length.toString()}
                    icon="task_alt"
                    iconBgClass="bg-nora-success/10"
                    iconColorClass="text-nora-success"
                />
                <button
                    onClick={refresh}
                    className="p-4 bg-nora-blue-800 border border-nora-blue-700 rounded-3xl text-nora-gray-400 hover:text-nora-accent-400 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Actualizar
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500"></div>
                </div>
            ) : error ? (
                <div className="p-10 text-center bg-nora-blue-800/20 border border-nora-danger/30 rounded-3xl">
                    <p className="text-nora-danger font-bold">Error: {error}</p>
                </div>
            ) : (
                /* Orders Table */
                <>
                    <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/40 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-nora-blue-900/40 border-b border-nora-blue-700">
                                        <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">ID / Cliente</th>
                                        <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">Contenido</th>
                                        <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest text-center">Cant.</th>
                                        <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">Estado</th>
                                        <th className="px-6 py-5 text-xs font-black text-nora-gray-400 uppercase tracking-widest">Finalizado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-nora-blue-700/30">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-nora-blue-600/10 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-nora-accent-400 uppercase">#{order.id.split('-')[0]}</span>
                                                        <span className="text-sm font-bold text-nora-gray-100">{order.cliente_nombre}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-nora-gray-400 line-clamp-1 max-w-xs">
                                                        {(order.items ?? []).map(i => i.nombre).join(', ')}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 rounded-md bg-nora-blue-700/30 text-nora-gray-300 text-xs font-bold">
                                                        {(order.items ?? []).reduce((a, i) => a + i.cantidad, 0)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${order.estado === 'pagada' ? 'bg-nora-info/20 text-nora-info border border-nora-info/30' : 'bg-nora-success/20 text-nora-success border border-nora-success/30'
                                                        }`}>
                                                        {order.estado === 'pagada' ? 'Pagada' : 'Lista'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-nora-gray-200 font-medium flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm text-nora-success">schedule</span>
                                                        {new Date(order.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
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
                </>
            )}
        </div>
    );
}