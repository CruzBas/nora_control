'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getCierreCajaAction, saveCierreCajaAction } from '@/lib/actions/ordenes.actions';

interface CierreCajaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import Modal from '../common/Modal';

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

    const fmt = (n: number) => `₡${n.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    const imprimir = () => {
        if (!data) return;
        const windowPrint = window.open('', '', 'width=800,height=600');
        if (windowPrint) {
            windowPrint.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="utf-8">
                <title>Cierre de Caja - Hoy</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .ticket { max-width: 350px; margin: 0 auto; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
                    h2, h3 { text-align: center; margin: 5px 0; }
                    .row { display: flex; justify-content: space-between; margin: 8px 0; }
                    .divider { border-top: 1px dashed #000; margin: 15px 0; }
                    .bold { font-weight: bold; }
                    .text-center { text-align: center; }
                </style>
                </head>
                <body>
                  <div class="ticket">
                     <h2>NORA</h2>
                     <h3>Cierre de Caja</h3>
                     <div class="divider"></div>
                     <div class="row"><span>Fecha:</span><span>${new Date().toLocaleString('es-CR')}</span></div>
                     <div class="row"><span>Órdenes:</span><span>${data.ordenes_count}</span></div>
                     <div class="divider"></div>
                     <div class="row"><span>Efectivo:</span><span>${fmt(data.total_efectivo)}</span></div>
                     <div class="row"><span>Tarjeta:</span><span>${fmt(data.total_tarjeta)}</span></div>
                     <div class="row"><span>SINPE:</span><span>${fmt(data.total_sinpe)}</span></div>
                     <div class="row"><span>Otro:</span><span>${fmt(data.total_otro)}</span></div>
                     <div class="divider"></div>
                     <div class="row bold" style="font-size: 18px;"><span>TOTAL:</span><span>${fmt(data.total_general)}</span></div>
                  </div>
                  <script>
                    window.print();
                  </script>
                </body>
                </html>
            `);
            windowPrint.document.close();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cierre de Caja">
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/30 rounded-xl text-nora-danger text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                {!data && !loading && (
                    <div className="text-center py-4 space-y-3">
                        <div className="text-5xl">🏧</div>
                        <p className="text-nora-gray-300 font-bold">¿Cerrar caja hoy?</p>
                        <p className="text-nora-gray-500 text-xs text-balance px-4">Calcularemos los totales de todas las órdenes cobradas hasta este momento.</p>
                        <button
                            onClick={cargar}
                            className="w-full mt-4 py-4 bg-nora-accent-500 text-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 uppercase tracking-widest text-sm"
                        >
                            Calcular Totales
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-nora-accent-500" />
                        <span className="text-nora-gray-400 text-xs animate-pulse">Obteniendo datos...</span>
                    </div>
                )}

                {data && !loading && (
                    <div className="space-y-4">
                        <div className="bg-nora-blue-900/40 rounded-2xl p-5 border border-nora-blue-700/50">
                            <div className="space-y-3">
                                {[
                                    { label: '💵 Efectivo', value: data.total_efectivo },
                                    { label: '💳 Tarjeta', value: data.total_tarjeta },
                                    { label: '📱 SINPE', value: data.total_sinpe },
                                    { label: '❓ Otro', value: data.total_otro },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-nora-blue-700/20 last:border-0">
                                        <span className="text-xs font-bold text-nora-gray-400">{label}</span>
                                        <span className="text-sm font-black text-nora-white">{fmt(value)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-nora-accent-500/30 flex justify-between items-center">
                                <span className="text-xs font-black text-nora-accent-400 uppercase">Total del Día</span>
                                <span className="text-2xl font-black text-nora-accent-400">{fmt(data.total_general)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={imprimir}
                                className="py-4 bg-nora-blue-700/50 text-white font-black rounded-2xl border border-nora-blue-600/50 uppercase tracking-widest text-xs"
                            >
                                🖨️ Ticket
                            </button>
                            <button
                                onClick={guardarCierre}
                                disabled={saving || saved}
                                className="py-4 bg-nora-success text-white font-black rounded-2xl shadow-lg shadow-nora-success/20 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {saving ? '...' : saved ? '✓ Guardado' : '💾 Guardar'}
                            </button>
                        </div>

                        {saved && (
                            <p className="text-center text-[10px] text-nora-success font-bold uppercase animate-bounce mt-2">
                                El cierre se ha registrado exitosamente
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
