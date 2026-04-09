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

import Modal from '../common/Modal';

export default function CheckoutModal({ isOpen, onClose, onFinish, total, loading = false }: CheckoutModalProps) {
    const [clienteNombre, setClienteNombre] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const handleFinish = () => {
        onFinish(clienteNombre.trim() || 'Cliente', observaciones.trim());
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Orden">
            <div className="space-y-6">
                <div className="text-center p-4 bg-nora-blue-900/40 rounded-3xl border border-nora-blue-700/30">
                    <p className="text-nora-gray-400 text-xs font-black uppercase tracking-widest mb-1">Monto Total</p>
                    <div className="text-4xl font-black text-nora-accent-400">
                        ₡{total.toLocaleString('es-CR')}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-nora-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Nombre / Mesa (opcional)
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
                        <label className="block text-[10px] font-black text-nora-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Notas de Preparación
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Ej. Sin cebolla, alérgico al maní..."
                            rows={2}
                            className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white placeholder-nora-gray-600 focus:ring-2 focus:ring-nora-accent-500 outline-none text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleFinish}
                        disabled={loading}
                        className="w-full py-4 bg-nora-accent-500 text-nora-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 active:scale-[0.98] transition-all enabled:hover:bg-nora-accent-400 disabled:opacity-60 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />Enviando...</>
                        ) : (
                            <>🍳 Enviar a Cocina</>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full mt-3 py-3 text-nora-gray-500 font-bold hover:text-nora-gray-300 transition-colors text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
