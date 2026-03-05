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
        <div className="fixed inset-0 bg-nora-blue-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-nora-blue-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-nora-blue-700 overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 text-center border-b border-nora-blue-700 bg-nora-blue-900/50 relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-nora-gray-500 hover:text-nora-white hover:bg-nora-blue-700 rounded-full transition-all">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                    <div className="text-4xl mb-3">💳</div>
                    <h3 className="text-2xl font-black text-nora-white mb-1 uppercase tracking-tighter">Cobrar Orden</h3>
                    <p className="text-nora-gray-400 text-sm font-medium">{orden.cliente_nombre}</p>
                    <div className="text-4xl font-black text-nora-accent-400 mt-3">
                        ₡{orden.total.toLocaleString('es-CR')}
                    </div>
                    <div className="flex justify-center gap-4 mt-2 text-xs text-nora-gray-500">
                        <span>Subtotal: ₡{orden.subtotal.toLocaleString('es-CR')}</span>
                        <span>IVA: ₡{orden.impuesto.toLocaleString('es-CR')}</span>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-nora-danger/10 border border-nora-danger/30 rounded-xl text-nora-danger text-sm font-bold text-center">
                            {error}
                        </div>
                    )}
                    <p className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center">
                        Seleccione Método de Pago
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        {METODOS.map(({ id, name, icon: Icon, color }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedMethod(id)}
                                className={`group p-6 border-2 rounded-3xl flex flex-col items-center transition-all duration-300 active:scale-95 ${selectedMethod === id
                                        ? 'border-nora-accent-500 bg-nora-accent-500/10'
                                        : 'border-nora-blue-700 hover:border-nora-accent-500/50 hover:bg-nora-accent-500/5'
                                    }`}
                            >
                                <Icon className={`h-8 w-8 ${color} mb-3 ${selectedMethod === id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                <span className={`font-bold text-sm ${selectedMethod === id ? 'text-nora-white' : 'text-nora-gray-200'}`}>
                                    {name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-nora-blue-900/50 flex space-x-4">
                    <button onClick={onClose} disabled={loading} className="flex-1 py-4 text-nora-gray-400 font-bold hover:text-nora-white transition-colors text-sm uppercase tracking-widest">
                        Cancelar
                    </button>
                    <button
                        disabled={!selectedMethod || loading}
                        onClick={handlePagar}
                        className="flex-[2] py-4 bg-nora-success text-nora-white font-black rounded-2xl shadow-lg shadow-nora-success/20 active:scale-[0.98] transition-all enabled:hover:brightness-110 disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />Procesando...</>
                        ) : (
                            <>✅ Confirmar Pago</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
