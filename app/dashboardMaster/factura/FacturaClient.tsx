'use client';

import { useState, useEffect } from 'react';
import { Orden, MetodoPago } from '@/lib/types';
import { pagarOrdenAction } from '@/lib/actions/ordenes.actions';

interface FacturaClientProps {
    initialOrdenes: Orden[];
    initialCerradas: Orden[];
}

export default function FacturaClient({ initialOrdenes, initialCerradas }: FacturaClientProps) {
    const [ordenes, setOrdenes] = useState<Orden[]>(initialOrdenes);
    const [cerradas, setCerradas] = useState<Orden[]>(initialCerradas);
    const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
    const [activeTab, setActiveTab] = useState<'pendientes' | 'cerradas'>('pendientes');
    const [loading, setLoading] = useState(false);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');

    const [isSplitMode, setIsSplitMode] = useState(false);
    const [pagosList, setPagosList] = useState<{ id: string, metodo: MetodoPago, monto: number }[]>([]);

    useEffect(() => {
        if (selectedOrden) {
            setMetodoPago('efectivo');
            setIsSplitMode(false);
            setPagosList([{ id: Date.now().toString(), metodo: 'efectivo', monto: selectedOrden.total }]);
        }
    }, [selectedOrden]);

    const handleAutoSplit = (n: number) => {
        if (!selectedOrden || n < 1) return;
        const splitAmount = Math.floor((selectedOrden.total / n));
        const newPagos = [];
        let runningTotal = 0;
        for (let i = 0; i < n; i++) {
            const isLast = i === n - 1;
            const monto = isLast ? (selectedOrden.total - runningTotal) : splitAmount;
            runningTotal += monto;
            newPagos.push({ id: (Date.now() + i).toString(), metodo: 'efectivo' as MetodoPago, monto });
        }
        setPagosList(newPagos);
    };

    const addPagoLine = () => {
        const remaining = selectedOrden ? selectedOrden.total - pagosList.reduce((sum, p) => sum + p.monto, 0) : 0;
        setPagosList([...pagosList, { id: Date.now().toString(), metodo: 'efectivo', monto: remaining > 0 ? remaining : 0 }]);
    };

    const updatePago = (id: string, field: 'metodo' | 'monto', value: any) => {
        setPagosList(prev => prev.map(p => {
            if (p.id === id) return { ...p, [field]: value };
            return p;
        }));
    };

    const removePago = (id: string) => {
        setPagosList(prev => prev.filter(p => p.id !== id));
    };

    const currentTotalPaid = pagosList.reduce((sum, p) => sum + p.monto, 0);
    const unassignedAmount = selectedOrden ? selectedOrden.total - currentTotalPaid : 0;
    const isReadyToPay = isSplitMode 
        ? Math.abs(unassignedAmount) < 0.01 && pagosList.length > 0
        : true;

    const handlePagar = async () => {
        if (!selectedOrden) return;
        if (isSplitMode && Math.abs(unassignedAmount) > 0.01) {
            alert('El total pagado debe ser exactamente igual al total de la orden.');
            return;
        }

        setLoading(true);
        try {
            let res;
            if (isSplitMode) {
                const pagosRecord: Record<string, number> = {};
                for (const p of pagosList) {
                    pagosRecord[p.metodo] = Number((pagosRecord[p.metodo] || 0)) + Number(p.monto);
                }
                res = await pagarOrdenAction(selectedOrden.id, 'mixto', pagosRecord);
            } else {
                res = await pagarOrdenAction(selectedOrden.id, metodoPago);
            }

            if (res.success && res.data) {
                setOrdenes(prev => prev.filter(o => o.id !== selectedOrden.id));
                setCerradas(prev => [res.data as Orden, ...prev]);
                setSelectedOrden(null);
                // Not using alert per best practices, but user specifically asked for basic functionality so preserving existing alert.
                alert('Orden cerrada y pagada con éxito.');
            } else {
                alert('Error al procesar pago: ' + res.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 space-y-4">
                <div className="flex bg-nora-blue-900/40 p-1 rounded-xl">
                    <button 
                        onClick={() => { setActiveTab('pendientes'); setSelectedOrden(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'pendientes' ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/20' : 'text-nora-gray-500 hover:text-nora-gray-300'}`}
                    >
                        Pendientes ({ordenes.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('cerradas'); setSelectedOrden(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'cerradas' ? 'bg-nora-blue-700 text-white shadow-lg' : 'text-nora-gray-500 hover:text-nora-gray-300'}`}
                    >
                        Cerradas ({cerradas.length})
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                    {activeTab === 'pendientes' && (
                        ordenes.length === 0 ? (
                            <div className="p-8 text-center bg-nora-blue-900/30 rounded-3xl border border-dashed border-nora-blue-700/50">
                                <p className="text-nora-gray-500 text-sm italic">No hay órdenes por cobrar.</p>
                            </div>
                        ) : (
                            ordenes.map((orden) => (
                                <button
                                    key={orden.id}
                                    onClick={() => setSelectedOrden(orden)}
                                    className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 ${selectedOrden?.id === orden.id
                                        ? 'bg-nora-accent-500/10 border-nora-accent-500 shadow-lg shadow-nora-accent-500/5'
                                        : 'bg-nora-blue-900/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black text-nora-accent-400 uppercase tracking-widest">
                                            #{orden.id.slice(0, 4)}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${orden.estado === 'lista'
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {orden.estado}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-nora-white mb-1 truncate">
                                        {orden.cliente_nombre || 'Cliente'}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-nora-gray-400 text-xs italic">
                                            {new Date(orden.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-nora-accent-400 font-black text-lg">
                                            ₡{Number(orden.total).toLocaleString()}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )
                    )}

                    {activeTab === 'cerradas' && (
                        cerradas.length === 0 ? (
                            <div className="p-8 text-center bg-nora-blue-900/30 rounded-3xl border border-dashed border-nora-blue-700/50">
                                <p className="text-nora-gray-500 text-sm italic">No hay órdenes cerradas hoy.</p>
                            </div>
                        ) : (
                            cerradas.map((orden) => (
                                <button
                                    key={orden.id}
                                    onClick={() => setSelectedOrden(orden)}
                                    className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 ${selectedOrden?.id === orden.id
                                        ? 'bg-nora-blue-800/80 border-nora-blue-600 shadow-lg'
                                        : 'bg-nora-blue-900/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black text-nora-gray-400 uppercase tracking-widest">
                                            #{orden.id.slice(0, 4)}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-nora-blue-700 text-nora-gray-300">
                                            PAGADA
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-nora-gray-200 mb-1 truncate">
                                        {orden.cliente_nombre || 'Cliente'}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <span className="material-symbols-outlined text-[14px] text-nora-gray-500">
                                                {orden.metodo_pago === 'efectivo' ? 'payments' : orden.metodo_pago === 'tarjeta' ? 'credit_card' : orden.metodo_pago === 'sinpe' ? 'smartphone' : orden.metodo_pago === 'mixto' ? 'call_split' : 'more_horiz'}
                                            </span>
                                            <span className="text-nora-gray-400 text-[10px] font-black uppercase">{orden.metodo_pago}</span>
                                        </div>
                                        <span className="text-nora-white font-black text-sm">
                                            ₡{Number(orden.total).toLocaleString()}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )
                    )}
                </div>
            </div>


            <div className="lg:col-span-2">
                {selectedOrden ? (
                    <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-8 space-y-8 h-full flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-nora-white uppercase tracking-tight mb-1">
                                    {selectedOrden.cliente_nombre || 'Cliente'}
                                </h2>
                                <p className="text-nora-gray-500 text-sm font-medium tracking-wide">
                                    ORDEN ID: {selectedOrden.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrden(null)}
                                className="text-nora-gray-500 hover:text-nora-gray-300 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {selectedOrden.estado === 'pendiente' && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-yellow-500">warning</span>
                                    <p className="text-xs font-bold text-nora-gray-200">
                                        Esta orden aún no ha sido marcada como <span className="text-yellow-500">LISTA</span> en cocina.
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const { marcarOrdenListaAction } = await import('@/lib/actions/ordenes.actions');
                                            const res = await marcarOrdenListaAction(selectedOrden.id, []);
                                            if (res.success && res.data) {
                                                const updated = res.data;
                                                setOrdenes(prev => prev.map(o => o.id === updated.id ? updated : o));
                                                setSelectedOrden(updated);
                                            }
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Saltar Cocina
                                </button>
                            </div>
                        )}

                        <div className="flex-1 space-y-4">
                            <h3 className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest border-b border-nora-blue-700/50 pb-2">
                                Resumen de Compra
                            </h3>
                            <div className="space-y-3">
                                {(selectedOrden as any).items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-xl bg-nora-blue-800 flex items-center justify-center text-[10px] font-black text-nora-accent-400">
                                                {item.cantidad}x
                                            </span>
                                            <span className="text-sm font-bold text-nora-gray-200">{item.nombre}</span>
                                        </div>
                                        <span className="text-sm font-black text-nora-gray-300">
                                            ₡{(item.precio * item.cantidad).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedOrden.estado !== 'pagada' ? (
                            <>
                                {!isSplitMode ? (
                                    <div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-6 border-y border-nora-blue-700/50">
                                            {(['efectivo', 'tarjeta', 'sinpe', 'otro'] as MetodoPago[]).map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setMetodoPago(m)}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${metodoPago === m
                                                        ? 'bg-nora-accent-500/10 border-nora-accent-500 text-nora-accent-400'
                                                        : 'bg-nora-blue-800/30 border-nora-blue-700/40 text-nora-gray-500 hover:border-nora-blue-600'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {m === 'efectivo' ? 'payments' : m === 'tarjeta' ? 'credit_card' : m === 'sinpe' ? 'smartphone' : 'more_horiz'}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-center pb-2">
                                            <button 
                                                onClick={() => setIsSplitMode(true)} 
                                                className="inline-flex items-center gap-2 text-nora-accent-400 text-[10px] font-black uppercase tracking-widest hover:text-nora-accent-300 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">call_split</span>
                                                Dividir Cuenta / Pago Mixto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 border-y border-nora-blue-700/50 space-y-4">
                                        <div className="flex justify-between items-center bg-nora-blue-900/60 p-3 rounded-xl border border-nora-blue-700/50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest">Dividir en:</span>
                                                <div className="flex gap-1">
                                                    {[2, 3, 4, 5].map(n => (
                                                        <button 
                                                            key={n}
                                                            onClick={() => handleAutoSplit(n)} 
                                                            className="w-8 h-8 rounded-lg bg-nora-blue-800 text-nora-white text-xs font-bold hover:bg-nora-accent-500 hover:text-white transition-colors"
                                                        >
                                                            {n}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => addPagoLine()} 
                                                className="px-4 py-2 bg-nora-accent-500/20 text-nora-accent-400 hover:bg-nora-accent-500 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                                            >
                                                + Pago
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {pagosList.map((p, i) => (
                                                <div key={p.id} className="flex flex-col sm:flex-row items-center gap-2 bg-nora-blue-900/40 p-3 rounded-xl border border-nora-blue-800">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-nora-blue-800 rounded-lg text-[10px] font-black text-nora-gray-400">
                                                        {i + 1}
                                                    </div>
                                                    <select
                                                        value={p.metodo}
                                                        onChange={(e) => updatePago(p.id, 'metodo', e.target.value)}
                                                        className="w-full sm:w-auto flex-1 bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                                                    >
                                                        <option value="efectivo">EFECTIVO</option>
                                                        <option value="tarjeta">TARJETA</option>
                                                        <option value="sinpe">SINPE</option>
                                                        <option value="otro">OTRO</option>
                                                    </select>
                                                    <div className="relative w-full sm:flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nora-accent-400 text-sm font-black">₡</span>
                                                        <input
                                                            type="number"
                                                            value={p.monto === 0 ? '' : p.monto}
                                                            onChange={e => updatePago(p.id, 'monto', Number(e.target.value))}
                                                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-black rounded-xl p-3 pl-8 outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => removePago(p.id)} 
                                                        className="w-full sm:w-auto p-3 text-nora-danger/70 hover:text-nora-danger hover:bg-nora-danger/10 rounded-xl transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-2 px-2">
                                            <button 
                                                onClick={() => setIsSplitMode(false)} 
                                                className="text-nora-gray-500 hover:text-nora-white text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                                                Volver a Pago Único
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-nora-gray-400 tracking-widest uppercase">Restante:</span>
                                                <span className={`text-lg font-black ${unassignedAmount === 0 ? 'text-green-400' : unassignedAmount < 0 ? 'text-nora-danger' : 'text-yellow-400'}`}>
                                                    {unassignedAmount === 0 ? 'COMPLETO' : `₡${Math.abs(unassignedAmount).toLocaleString()}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-nora-gray-400 font-bold uppercase tracking-widest text-xs">Total a Pagar</span>
                                        <span className="text-4xl font-black text-nora-white">
                                            ₡{Number(selectedOrden.total).toLocaleString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handlePagar}
                                        disabled={loading || !isReadyToPay}
                                        className={`w-full py-6 font-black rounded-3xl shadow-xl uppercase tracking-widest text-lg transition-all ${
                                            isReadyToPay
                                                ? 'bg-nora-accent-500 text-white shadow-nora-accent-500/20 hover:bg-nora-accent-400 active:scale-[0.98]'
                                                : 'bg-nora-gray-800 text-nora-gray-500 cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {loading ? 'Procesando...' : isSplitMode && !isReadyToPay ? 'Complete los montos' : 'Cerrar y Pagar Orden'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 pt-4 border-t border-nora-blue-700/50">
                                <div className="bg-nora-blue-800/40 border border-nora-blue-700 rounded-3xl p-8 w-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-nora-gray-400 font-bold uppercase tracking-widest text-xs">Monto Pagado</span>
                                        <span className="text-4xl font-black text-green-400">
                                            ₡{Number(selectedOrden.total).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedOrden.metodo_pago === 'mixto' && selectedOrden.pagos ? (
                                            Object.entries(selectedOrden.pagos).map(([metodo, monto]) => (
                                                <div key={metodo} className="flex justify-between items-center bg-nora-blue-900/50 p-3 rounded-xl border border-nora-blue-700/50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-nora-gray-400 text-[18px]">
                                                            {metodo === 'efectivo' ? 'payments' : metodo === 'tarjeta' ? 'credit_card' : metodo === 'sinpe' ? 'smartphone' : 'more_horiz'}
                                                        </span>
                                                        <span className="text-xs font-black uppercase text-nora-gray-300">{metodo}</span>
                                                    </div>
                                                    <span className="font-black text-nora-white">₡{Number(monto).toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between items-center bg-nora-blue-900/50 p-3 rounded-xl border border-nora-blue-700/50">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-nora-gray-400 text-[18px]">
                                                        {selectedOrden.metodo_pago === 'efectivo' ? 'payments' : selectedOrden.metodo_pago === 'tarjeta' ? 'credit_card' : selectedOrden.metodo_pago === 'sinpe' ? 'smartphone' : 'more_horiz'}
                                                    </span>
                                                    <span className="text-xs font-black uppercase text-nora-gray-300">{selectedOrden.metodo_pago}</span>
                                                </div>
                                                <span className="font-black text-nora-white">₡{Number(selectedOrden.total).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-nora-blue-900/20 border border-dashed border-nora-blue-700/40 rounded-3xl p-12 text-center">
                        <div className="w-24 h-24 mb-6 bg-nora-blue-800/50 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-nora-blue-600 text-5xl">
                                receipt_long
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-nora-gray-500 uppercase tracking-widest">
                            Selecciona una orden
                        </h2>
                        <p className="text-nora-gray-600 text-sm mt-2 max-w-xs">
                            Selecciona una orden de la lista para gestionar su cobro y finalizar la transacción.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
