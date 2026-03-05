'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getCierreCajaAction, saveCierreCajaAction } from '@/lib/actions/ordenes.actions';

interface CierreCajaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CierreCajaModal({ isOpen, onClose }: CierreCajaModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [data, setData] = useState<{
        total_efectivo: number; total_tarjeta: number; total_sinpe: number;
        total_otro: number; total_general: number; ordenes_count: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cargar = async () => {
        setLoading(true);
        setError(null);
        setSaved(false);
        try {
            const res = await getCierreCajaAction();
            if (res.success && res.data) {
                setData(res.data);
            } else {
                setError(res.error ?? 'Error al cargar datos');
            }
        } catch {
            setError('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const guardarCierre = async () => {
        if (!data) return;
        setSaving(true);
        try {
            await saveCierreCajaAction({
                fecha: new Date().toISOString().split('T')[0],
                total_efectivo: data.total_efectivo,
                total_tarjeta: data.total_tarjeta,
                total_sinpe: data.total_sinpe,
                total_otro: data.total_otro,
                total_general: data.total_general,
                ordenes_count: data.ordenes_count,
            });
            setSaved(true);
        } catch {
            setError('Error al guardar cierre');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const fmt = (n: number) => `₡${n.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="fixed inset-0 bg-nora-blue-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-nora-blue-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-nora-blue-700 overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-nora-blue-700 flex items-center justify-between bg-nora-blue-900/40">
                    <div>
                        <h3 className="text-xl font-black text-nora-white uppercase tracking-tight">Cierre de Caja</h3>
                        <p className="text-nora-gray-400 text-xs mt-1">
                            {new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-nora-gray-400 hover:text-nora-white hover:bg-nora-blue-700 rounded-full transition-all">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-nora-danger/10 border border-nora-danger/30 rounded-xl text-nora-danger text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    {!data && !loading && (
                        <div className="text-center py-8 space-y-3">
                            <div className="text-5xl">🏧</div>
                            <p className="text-nora-gray-300 font-bold">¿Listo para cerrar caja?</p>
                            <p className="text-nora-gray-500 text-sm">Se calcularán los totales de todas las órdenes pagadas hoy.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-nora-accent-500" />
                        </div>
                    )}

                    {data && !loading && (
                        <div className="space-y-3">
                            <div className="bg-nora-blue-900/40 rounded-2xl p-4 border border-nora-blue-700/50">
                                <p className="text-xs font-black text-nora-gray-400 uppercase tracking-widest mb-3">
                                    Órdenes cobradas hoy: {data.ordenes_count}
                                </p>
                                {[
                                    { label: '💵 Efectivo', value: data.total_efectivo },
                                    { label: '💳 Tarjeta', value: data.total_tarjeta },
                                    { label: '📱 SINPE', value: data.total_sinpe },
                                    { label: '❓ Otro', value: data.total_otro },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-nora-blue-700/30 last:border-0">
                                        <span className="text-sm font-bold text-nora-gray-300">{label}</span>
                                        <span className="text-sm font-black text-nora-white">{fmt(value)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-nora-accent-500/10 border border-nora-accent-500/30 rounded-2xl p-5 flex justify-between items-center">
                                <span className="font-black text-nora-white uppercase tracking-wider text-sm">TOTAL DEL DÍA</span>
                                <span className="text-3xl font-black text-nora-accent-400">
                                    {fmt(data.total_general)}
                                </span>
                            </div>

                            {saved && (
                                <div className="p-3 bg-nora-success/10 border border-nora-success/30 rounded-xl text-nora-success text-sm font-bold text-center">
                                    ✅ Cierre guardado correctamente
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-nora-blue-900/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 text-nora-gray-400 font-bold hover:text-nora-white transition-colors text-sm uppercase tracking-widest">
                        Cerrar
                    </button>
                    {!data ? (
                        <button
                            onClick={cargar}
                            disabled={loading}
                            className="flex-[2] py-4 bg-nora-accent-500 text-white font-black rounded-2xl hover:bg-nora-accent-400 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                            Calcular Cierre
                        </button>
                    ) : (
                        <button
                            onClick={guardarCierre}
                            disabled={saving || saved}
                            className="flex-[2] py-4 bg-nora-success text-white font-black rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                        >
                            {saving ? 'Guardando...' : saved ? '✅ Guardado' : 'Guardar y Cerrar'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
