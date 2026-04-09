'use client';

import { useState, useEffect } from 'react';
import { getOrdenesRecientesAction } from '@/lib/actions/ordenes.actions';
import { Orden } from '@/lib/types';

const ESTADO_STYLES: Record<string, string> = {
    pagada: 'bg-nora-success/15 text-nora-success',
    lista: 'bg-blue-500/15 text-blue-400',
    pendiente: 'bg-yellow-500/15 text-yellow-400',
    cancelada: 'bg-nora-danger/15 text-nora-danger',
};

const ESTADO_LABELS: Record<string, string> = {
    pagada: 'Pagada',
    lista: 'Lista',
    pendiente: 'En Cocina',
    cancelada: 'Cancelada',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    return new Date(dateStr).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' });
}

function initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export default function TransactionsTable() {
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrdenesRecientesAction(10).then(res => {
            if (res.success && res.data) setOrdenes(res.data);
            setLoading(false);
        });
    }, []);

    const fmt = (n: number) => `₡${n.toLocaleString('es-CR', { minimumFractionDigits: 0 })}`;

    return (
        <div className="bg-nora-blue-800/60 rounded-xl border border-nora-blue-700/40 shadow-[var(--nora-shadow-sm)] overflow-hidden">
            <div className="p-5 md:p-6 border-b border-nora-blue-700/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-lg font-bold text-nora-gray-100">Transacciones Recientes</h4>
                <span className="text-xs text-nora-gray-500 font-medium">Últimas 10 órdenes</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-nora-accent-500" />
                </div>
            ) : ordenes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">📋</span>
                    <p className="text-nora-gray-400 font-bold">Sin órdenes todavía</p>
                    <p className="text-nora-gray-600 text-sm mt-1">Las órdenes aparecerán aquí cuando se creen.</p>
                </div>
            ) : (
                <>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-nora-blue-700/25">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider">Hora</th>
                                    <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-nora-blue-700/30">
                                {ordenes.map(orden => (
                                    <tr key={orden.id} className="hover:bg-nora-blue-700/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-nora-blue-600/50 flex items-center justify-center font-bold text-xs text-nora-gray-200 shrink-0">
                                                    {initials(orden.cliente_nombre)}
                                                </div>
                                                <span className="text-sm font-semibold text-nora-gray-100">
                                                    {orden.cliente_nombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-nora-gray-400">{timeAgo(orden.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${ESTADO_STYLES[orden.estado] ?? ''}`}>
                                                {ESTADO_LABELS[orden.estado] ?? orden.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-right text-nora-gray-100">
                                            {fmt(orden.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    <div className="md:hidden divide-y divide-nora-blue-700/30">
                        {ordenes.map(orden => (
                            <div key={orden.id} className="p-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-full bg-nora-blue-600/50 flex items-center justify-center font-bold text-xs text-nora-gray-200 shrink-0">
                                        {initials(orden.cliente_nombre)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-nora-gray-100 truncate">{orden.cliente_nombre}</p>
                                        <p className="text-xs text-nora-gray-400">{timeAgo(orden.created_at)}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-nora-gray-100">{fmt(orden.total)}</p>
                                    <span className={`text-[10px] font-bold ${ESTADO_STYLES[orden.estado] ?? ''} px-2 py-0.5 rounded-full`}>
                                        {ESTADO_LABELS[orden.estado] ?? orden.estado}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
