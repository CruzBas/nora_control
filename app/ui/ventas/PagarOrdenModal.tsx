'use client';

import { useState } from 'react';
import { BanknotesIcon, CreditCardIcon, DevicePhoneMobileIcon, EllipsisHorizontalCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MetodoPago, Orden } from '@/lib/types';
import { pagarOrdenAction } from '@/lib/actions/ordenes.actions';

interface PagarOrdenModalProps {
    orden: Orden | null;
    onClose: () => void;
    onSuccess: () => void;
}

const METODOS = [
    { id: 'efectivo' as MetodoPago, name: 'Efectivo', icon: BanknotesIcon, color: 'text-green-400' },
    { id: 'tarjeta' as MetodoPago, name: 'Tarjeta', icon: CreditCardIcon, color: 'text-blue-400' },
    { id: 'sinpe' as MetodoPago, name: 'SINPE', icon: DevicePhoneMobileIcon, color: 'text-purple-400' },
    { id: 'otro' as MetodoPago, name: 'Otro', icon: EllipsisHorizontalCircleIcon, color: 'text-nora-gray-400' },
];

import Modal from '../common/Modal';

export default function PagarOrdenModal({ orden, onClose, onSuccess }: PagarOrdenModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<MetodoPago | null>(null);
    const [moneda, setMoneda] = useState<'CRC' | 'USD'>('CRC');
    const [tipoCambio, setTipoCambio] = useState(525);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!orden) return null;

    const handlePagar = async () => {
        if (!selectedMethod) return;
        setLoading(true);
        setError(null);
        try {
            // Note: In the action, we'll ensure conversion happens if needed, 
            // but the user wants the total in CRC for reports.
            const res = await pagarOrdenAction(orden.id, selectedMethod, undefined, moneda, tipoCambio);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError(res.error ?? 'Error al procesar el pago');
            }
        } catch (err) {
            setError('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const totalUSD = (orden.total / tipoCambio).toFixed(2);

    return (
        <Modal isOpen={!!orden} onClose={onClose} title="Cobrar Orden">
            <div className="space-y-6">
                <div className="flex justify-center p-1 bg-nora-blue-900/60 rounded-2xl border border-nora-blue-700/50 mb-4">
                    <button 
                        onClick={() => setMoneda('CRC')}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all ${moneda === 'CRC' ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/20' : 'text-nora-gray-400 hover:text-nora-gray-200'}`}
                    >
                        Colones (CRC)
                    </button>
                    <button 
                        onClick={() => setMoneda('USD')}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all ${moneda === 'USD' ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/20' : 'text-nora-gray-400 hover:text-nora-gray-200'}`}
                    >
                        Dólares (USD)
                    </button>
                </div>

                <div className="text-center p-6 bg-nora-blue-900/40 rounded-3xl border border-nora-blue-700/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">payments</span>
                    </div>
                    <p className="text-nora-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{orden.cliente_nombre}</p>
                    <div className="text-4xl font-black text-nora-accent-400 mb-2">
                        {moneda === 'CRC' ? `₡${orden.total.toLocaleString('es-CR')}` : `$${totalUSD}`}
                    </div>
                    {moneda === 'USD' && (
                        <div className="flex flex-col items-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                            <p className="text-[10px] text-nora-gray-500 font-black uppercase tracking-widest">Tipo de Cambio</p>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nora-accent-400 font-black text-xs">₡</span>
                                <input 
                                    type="number"
                                    value={tipoCambio}
                                    onChange={(e) => setTipoCambio(parseInt(e.target.value) || 0)}
                                    className="bg-nora-blue-800 border border-nora-blue-700 rounded-xl py-2 px-8 text-xs text-white font-black w-32 text-center focus:ring-1 focus:ring-nora-accent-500 outline-none"
                                />
                            </div>
                            <p className="text-[10px] text-nora-accent-400/60 font-bold mt-1">
                                Equivale a: ₡{orden.total.toLocaleString('es-CR')}
                            </p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/30 rounded-xl text-nora-danger text-[10px] font-black uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {METODOS.map(({ id, name, icon: Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedMethod(id)}
                            className={`group p-4 border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${selectedMethod === id
                                    ? 'border-nora-accent-500 bg-nora-accent-500/10 shadow-lg shadow-nora-accent-500/5'
                                    : 'border-nora-blue-700 hover:border-nora-accent-500/30 hover:bg-nora-accent-500/5'
                                }`}
                        >
                            <Icon className={`h-6 w-6 ${color} mb-2 ${selectedMethod === id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                            <span className={`font-black uppercase tracking-widest text-[10px] ${selectedMethod === id ? 'text-nora-white' : 'text-nora-gray-400'}`}>
                                {name}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="pt-2">
                    <button
                        disabled={!selectedMethod || loading}
                        onClick={handlePagar}
                        className="w-full py-4.5 bg-nora-success text-nora-white font-black rounded-2xl shadow-xl shadow-nora-success/20 active:scale-[0.98] transition-all enabled:hover:brightness-110 disabled:opacity-50 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />PROCESANDO...</>
                        ) : (
                            <><span className="material-symbols-outlined">verified_user</span>Confirmar Pago</>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full mt-3 py-3 text-nora-gray-500 font-bold hover:text-nora-gray-300 transition-colors text-[10px] uppercase tracking-[0.2em]"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
}

