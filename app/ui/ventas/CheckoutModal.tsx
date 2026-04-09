'use client';

import { XMarkIcon, BanknotesIcon, CreditCardIcon, DevicePhoneMobileIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { MetodoPago } from '@/lib/types';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinish: (clienteNombre: string, observaciones: string) => void;
    total: number;
    loading?: boolean;
}

export default function CheckoutModal({ isOpen, onClose, onFinish, total, loading = false }: CheckoutModalProps) {
    const [clienteNombre, setClienteNombre] = useState('');
    const [observaciones, setObservaciones] = useState('');

    if (!isOpen) return null;

    const handleFinish = () => {
        onFinish(clienteNombre.trim() || 'Cliente', observaciones.trim());
    };

    return (
        <div className="fixed inset-0 bg-nora-blue-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-nora-blue-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-nora-blue-700 overflow-hidden animate-in zoom-in duration-300">

                <div className="p-8 text-center border-b border-nora-blue-700 bg-nora-blue-900/50 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-nora-gray-500 hover:text-nora-white hover:bg-nora-blue-700 rounded-full transition-all"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                    <h3 className="text-2xl font-black text-nora-white mb-1 uppercase tracking-tighter">Confirmar Orden</h3>
                    <p className="text-nora-gray-400 text-sm mb-3">La orden irá a cocina para preparación</p>
                    <div className="text-4xl font-black text-nora-accent-400">
                        ₡{total.toLocaleString('es-CR')}
                    </div>
                </div>

                <div className="p-8 space-y-5">

                    <div>
                        <label className="block text-xs font-black text-nora-gray-400 uppercase tracking-widest mb-2">
                            Nombre del Cliente (opcional)
                        </label>
                        <input
                            value={clienteNombre}
                            onChange={e => setClienteNombre(e.target.value)}
                            placeholder="Ej. Juan Pérez, Mesa 3..."
                            className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white placeholder-nora-gray-600 focus:ring-2 focus:ring-nora-accent-500 outline-none text-sm"
                            onKeyDown={e => e.key === 'Enter' && handleFinish()}
                            autoFocus
                        />
                    </div>


                    <div>
                        <label className="block text-xs font-black text-nora-gray-400 uppercase tracking-widest mb-2">
                            Observaciones <span className="text-nora-gray-600 font-normal normal-case tracking-normal">(sin cebolla, sin picante, etc.)</span>
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Ej. Sin cebolla, término medio, alérgico al maní..."
                            rows={3}
                            className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white placeholder-nora-gray-600 focus:ring-2 focus:ring-nora-accent-500 outline-none text-sm resize-none"
                        />
                    </div>

                    <p className="text-xs text-nora-gray-500 text-center">
                        💳 El cajero cobrará cuando la cocina marque la orden como lista
                    </p>
                </div>


                <div className="p-6 bg-nora-blue-900/50 flex space-x-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-4 text-nora-gray-400 font-bold hover:text-nora-white transition-colors text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleFinish}
                        disabled={loading}
                        className="flex-[2] py-4 bg-nora-accent-500 text-nora-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 active:scale-[0.98] transition-all enabled:hover:bg-nora-accent-400 disabled:opacity-60 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />Enviando...</>
                        ) : (
                            <>🍳 Enviar a Cocina</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
