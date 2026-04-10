'use client';

import { useState, useEffect } from 'react';
import { Orden } from '@/lib/types';
import { useOrdenes } from '@/lib/hooks/useOrdenes';
import { marcarOrdenListaAction } from '@/lib/actions/ordenes.actions';

function Timer({ createdAt }: { createdAt: string }) {
    const [mins, setMins] = useState(0);

    useEffect(() => {
        const update = () => {
            const diffMs = Date.now() - new Date(createdAt).getTime();
            setMins(Math.max(0, Math.floor(diffMs / 60000)));
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${mins >= 20 ? 'bg-nora-danger/20 text-nora-danger border border-nora-danger/30' : mins >= 10 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            <span className="material-symbols-outlined text-[12px]">timer</span>
            {mins} min
        </span>
    );
}

export default function HomeCocina() {
    const { ordenes, loading, error, refresh } = useOrdenes();
    const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
    const [completing, setCompleting] = useState(false);

    const handleMarcarLista = async (orden: Orden) => {
        setCompleting(true);
        try {
            const itemsParaDescontar = (orden.items ?? []).map(item => ({
                receta_id: item.receta_id,
                quantity: item.cantidad,
            }));

            const res = await marcarOrdenListaAction(orden.id, itemsParaDescontar);
            if (res.success) {
                await refresh();
                setSelectedOrden(null);
            } else {
                alert(`Error: ${res.error}`);
            }
        } catch {
            alert('Error al completar la orden');
        } finally {
            setCompleting(false);
        }
    };

    const pendientes = ordenes.filter(o => {
        if (o.estado !== 'pendiente') return false;
        // Solo mostrar ordenes que tengan al menos un item de cocina
        return (o.items ?? []).some(i => i.requiere_cocina === true);
    });

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
                <h2 className="text-2xl font-bold text-white mb-2">Error al cargar pedidos</h2>
                <p className="text-nora-gray-400 mb-6">{error}</p>
                <button onClick={refresh} className="px-6 py-3 bg-nora-accent-500 text-white rounded-xl font-bold hover:bg-nora-accent-400 transition-colors">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight flex items-center gap-3">
                        🍳 Cocina
                        <span className="bg-nora-accent-500/20 text-nora-accent-400 text-sm py-1 px-3 rounded-full border border-nora-accent-500/30">
                            {pendientes.length} pendientes
                        </span>
                    </h1>
                    <p className="text-nora-gray-400 mt-1 font-medium">Marca las órdenes listas cuando estén preparadas.</p>
                </div>
                <button
                    onClick={refresh}
                    className="p-3 bg-nora-blue-800 border border-nora-blue-700 rounded-2xl text-nora-gray-400 hover:text-nora-accent-400 hover:border-nora-accent-500/50 transition-all"
                    title="Actualizar"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {pendientes.map(orden => (
                    <button
                        key={orden.id}
                        onClick={() => setSelectedOrden(orden)}
                        className="cursor-pointer text-left bg-nora-blue-800/60 hover:bg-nora-blue-800 border border-nora-blue-700/50 hover:border-nora-accent-500/50 rounded-3xl p-6 transition-all duration-200 active:scale-95 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-2">
                                <div className="w-12 h-12 bg-nora-accent-500/10 border border-nora-accent-500/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner shadow-nora-accent-500/10">
                                    🍽️
                                </div>
                                <Timer createdAt={orden.created_at} />
                            </div>
                            <span className="text-[10px] font-black text-nora-gray-400 bg-nora-blue-900 px-2 py-1 rounded-full border border-nora-blue-700">
                                {new Date(orden.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="font-black text-nora-gray-100 text-lg leading-tight mb-1 group-hover:text-nora-accent-300 transition-colors">
                            {orden.cliente_nombre}
                        </p>
                        <p className="text-nora-gray-400 text-sm font-medium">
                            {(orden.items ?? []).reduce((a, i) => a + i.cantidad, 0)} ítems
                        </p>
                        <div className="mt-4 space-y-1">
                            {(orden.items ?? []).filter(i => i.requiere_cocina !== false).map(item => (
                                <div key={item.id} className="flex items-center gap-2 text-xs text-nora-gray-400">
                                    <span className="w-5 h-5 bg-nora-blue-700/50 rounded-full flex items-center justify-center font-black text-nora-gray-300 text-[10px]">
                                        {item.cantidad}
                                    </span>
                                    <span className="truncate">{item.nombre}</span>
                                </div>
                            ))}
                        </div>
                    </button>
                ))}

                {pendientes.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl">
                        <span className="material-symbols-outlined text-6xl text-nora-blue-700 mb-4">check_circle</span>
                        <p className="text-nora-gray-400 font-bold text-xl">¡Cocina al día!</p>
                        <p className="text-nora-gray-500">No hay pedidos pendientes por ahora.</p>
                    </div>
                )}
            </div>


            {selectedOrden && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-nora-blue-900/80 backdrop-blur-sm" onClick={() => setSelectedOrden(null)} />
                    <div className="relative bg-nora-blue-800 w-full max-w-lg rounded-3xl border border-nora-blue-600 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-nora-blue-700 flex justify-between items-start bg-nora-blue-900/40">
                            <div>
                                <h2 className="text-2xl font-black text-white">{selectedOrden.cliente_nombre}</h2>
                                <p className="text-nora-accent-400 font-bold uppercase tracking-widest text-xs flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {new Date(selectedOrden.created_at).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrden(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-nora-blue-700/50 text-nora-gray-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
                            {(selectedOrden.items ?? []).filter(i => i.requiere_cocina !== false).map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-nora-blue-700/30 border border-nora-blue-700/50">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-nora-accent-500/10 border border-nora-accent-500/20 flex items-center justify-center text-nora-accent-400 font-black text-lg">
                                        {item.cantidad}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-nora-gray-100 uppercase tracking-tight">{item.nombre}</h3>
                                    </div>
                                </div>
                            ))}

                            {selectedOrden.observaciones && (
                                <div className="flex gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mt-2">
                                    <span className="text-xl flex-shrink-0">⚠️</span>
                                    <div>
                                        <p className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1">Observaciones</p>
                                        <p className="text-sm text-nora-gray-200">{selectedOrden.observaciones}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-nora-blue-900/50 border-t border-nora-blue-700 flex gap-3">
                            <button
                                onClick={() => setSelectedOrden(null)}
                                className="flex-1 py-4 px-6 rounded-2xl border border-nora-blue-600 text-nora-gray-300 font-bold hover:bg-nora-blue-700 transition-all"
                            >
                                VOLVER
                            </button>
                            <button
                                onClick={() => handleMarcarLista(selectedOrden)}
                                disabled={completing}
                                className="flex-[2] py-4 px-6 rounded-2xl bg-nora-success text-white font-black hover:brightness-110 transition-all disabled:opacity-70 shadow-lg shadow-nora-success/20 flex items-center justify-center gap-2"
                            >
                                {completing ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />PROCESANDO...</>
                                ) : (
                                    <><span className="material-symbols-outlined">check_circle</span>LISTA</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
