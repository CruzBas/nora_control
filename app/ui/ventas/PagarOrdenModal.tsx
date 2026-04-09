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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!orden) return null;

    const handlePagar = async () => {
        if (!selectedMethod) return;
        setLoading(true);
        setError(null);
        try {
            const res = await pagarOrdenAction(orden.id, selectedMethod);
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

    return (
        <Modal isOpen={!!orden} onClose={onClose} title="Cobrar Orden">
            <div className="space-y-6">
                <div className="text-center p-4 bg-nora-blue-900/40 rounded-3xl border border-nora-blue-700/30">
                    <p className="text-nora-gray-400 text-xs font-black uppercase tracking-widest mb-1">{orden.cliente_nombre}</p>
                    <div className="text-4xl font-black text-nora-accent-400">
                        ₡{orden.total.toLocaleString('es-CR')}
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/30 rounded-xl text-nora-danger text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    {METODOS.map(({ id, name, icon: Icon, color }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedMethod(id)}
                            className={`group p-4 border-2 rounded-2xl flex flex-col items-center transition-all duration-300 active:scale-95 ${selectedMethod === id
                                    ? 'border-nora-accent-500 bg-nora-accent-500/10'
                                    : 'border-nora-blue-700 hover:border-nora-accent-500/50 hover:bg-nora-accent-500/5'
                                }`}
                        >
                            <Icon className={`h-6 w-6 ${color} mb-2 ${selectedMethod === id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                            <span className={`font-bold text-xs ${selectedMethod === id ? 'text-nora-white' : 'text-nora-gray-300'}`}>
                                {name}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="pt-2">
                    <button
                        disabled={!selectedMethod || loading}
                        onClick={handlePagar}
                        className="w-full py-4 bg-nora-success text-nora-white font-black rounded-2xl shadow-lg shadow-nora-success/20 active:scale-[0.98] transition-all enabled:hover:brightness-110 disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />Procesando...</>
                        ) : (
                            <>✅ Confirmar Pago</>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full mt-3 py-3 text-nora-gray-500 font-bold hover:text-nora-gray-300 transition-colors text-xs uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
