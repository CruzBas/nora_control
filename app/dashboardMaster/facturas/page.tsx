'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrdenes } from '@/lib/hooks/useOrdenes';
import { useClientesFiscales } from '@/lib/hooks/useClientesFiscales';
import { Orden } from '@/lib/types';
import PagarOrdenModal from '@/app/ui/ventas/PagarOrdenModal';
import CierreCajaModal from '@/app/ui/ventas/CierreCajaModal';
import EmitirFacturaModal from '@/app/ui/facturacion/EmitirFacturaModal';


export default function FacturasPage() {
    const { ordenes, refresh } = useOrdenes();
    const { clientes } = useClientesFiscales();
    const [pagarOrden, setPagarOrden] = useState<Orden | null>(null);
    const [facturarOrden, setFacturarOrden] = useState<Orden | null>(null);
    const [cierreOpen, setCierreOpen] = useState(false);

    const pendientes = ordenes.filter(o => o.estado === 'pendiente');
    const listas = ordenes.filter(o => o.estado === 'lista');

    const fmt = (val: number) => new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        maximumFractionDigits: 0
    }).format(val);

    const ESTADO_BADGE: Record<string, { label: string; class: string }> = {
        pendiente: { label: '🍳 En Cocina', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        lista: { label: '✅ Lista', class: 'bg-nora-success/20 text-nora-success border-nora-success/30' },
    };

    return (



        <div className="flex flex-col min-h-screen bg-nora-blue-900">
            <div className="p-6 md:p-8 space-y-8">


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight">Órdenes</h1>
                        <p className="text-nora-gray-400 mt-1 font-medium">
                            {pendientes.length} en cocina · {listas.length} listas para cobrar
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setCierreOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-nora-blue-800 border border-nora-blue-700 rounded-2xl font-bold text-nora-gray-300 hover:text-white hover:border-nora-accent-500/50 transition-all text-sm"
                        >
                            <span className="material-symbols-outlined text-lg">point_of_sale</span>
                            Cierre de Caja
                        </button>
                        <Link
                            href="/dashboardMaster/ventas"
                            className="flex items-center gap-2 bg-nora-accent-500 hover:bg-nora-accent-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-nora-accent-500/25 active:scale-95 text-sm"
                        >
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                            Nueva Orden
                        </Link>
                    </div>
                </div>


                {listas.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-black text-nora-success uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-nora-success animate-pulse" />
                            Listas para cobrar ({listas.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {listas.map(orden => (
                                <div
                                    key={orden.id}
                                    className="text-left bg-nora-success/5 hover:bg-nora-success/10 border-2 border-nora-success/40 hover:border-nora-success/70 rounded-3xl p-5 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-2xl">✅</span>
                                        <span className="text-xs font-black text-nora-success bg-nora-success/10 px-2 py-1 rounded-full border border-nora-success/30">
                                            {fmt(orden.total)}
                                        </span>
                                    </div>
                                    <p className="font-black text-nora-gray-100 text-base leading-tight group-hover:text-white">
                                        {orden.cliente_nombre}
                                    </p>
                                    <p className="text-nora-gray-500 text-xs mt-1">
                                        {(orden.items ?? []).length} ítems · {new Date(orden.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => setPagarOrden(orden)}
                                            className="flex-1 py-2 bg-nora-success text-white text-xs font-black rounded-xl text-center tracking-widest uppercase active:scale-95 transition-all"
                                        >
                                            Cobrar
                                        </button>
                                        <button
                                            onClick={() => setFacturarOrden(orden)}
                                            className="py-2 px-3 bg-nora-accent-500/20 text-nora-accent-400 border border-nora-accent-500/30 text-xs font-bold rounded-xl text-center hover:bg-nora-accent-500/30 active:scale-95 transition-all"
                                            title="Emitir Factura Electrónica"
                                        >
                                            <span className="material-symbols-outlined text-sm">receipt_long</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="space-y-3">
                    <h2 className="text-xs font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        En preparación ({pendientes.length})
                    </h2>
                    {pendientes.length === 0 && listas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl text-center">
                            <span className="text-5xl mb-4">🛒</span>
                            <p className="text-nora-gray-400 font-bold text-xl">No hay órdenes activas</p>
                            <p className="text-nora-gray-500 text-sm mt-1">Crea una nueva orden desde el Punto de Venta.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pendientes.map(orden => (
                                <div
                                    key={orden.id}
                                    className="text-left bg-nora-blue-800/40 border border-nora-blue-700/50 rounded-3xl p-5"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-2xl">🍳</span>
                                        <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/30">
                                            {fmt(orden.total)}
                                        </span>
                                    </div>
                                    <p className="font-black text-nora-gray-100 text-base leading-tight">{orden.cliente_nombre}</p>
                                    <p className="text-nora-gray-500 text-xs mt-1">
                                        {(orden.items ?? []).length} ítems · {new Date(orden.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <div className="mt-3 w-full py-2 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-xl text-center border border-yellow-500/20">
                                        Esperando cocina...
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            <PagarOrdenModal
                orden={pagarOrden}
                onClose={() => setPagarOrden(null)}
                onSuccess={() => { setPagarOrden(null); refresh(); }}
            />


            <CierreCajaModal isOpen={cierreOpen} onClose={() => setCierreOpen(false)} />

            <EmitirFacturaModal
                orden={facturarOrden}
                clientes={clientes}
                onClose={() => setFacturarOrden(null)}
                onSuccess={() => { setFacturarOrden(null); refresh(); }}
            />
        </div>
    )
}