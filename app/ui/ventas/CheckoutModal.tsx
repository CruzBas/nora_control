'use client';

import { XMarkIcon, BanknotesIcon, CreditCardIcon, DevicePhoneMobileIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinish: () => void;
    total: number;
}

export default function CheckoutModal({ isOpen, onClose, onFinish, total }: CheckoutModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    if (!isOpen) return null;

    const paymentMethods = [
        { id: 'cash', name: 'Efectivo', icon: <BanknotesIcon className="h-8 w-8 text-green-400" /> },
        { id: 'card', name: 'Tarjeta', icon: <CreditCardIcon className="h-8 w-8 text-blue-400" /> },
        { id: 'sinpe', name: 'SINPE', icon: <DevicePhoneMobileIcon className="h-8 w-8 text-purple-400" /> },
        { id: 'other', name: 'Otro', icon: <EllipsisHorizontalCircleIcon className="h-8 w-8 text-nora-gray-400" /> },
    ];

    return (
        <div className="fixed inset-0 bg-nora-blue-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-nora-blue-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-nora-blue-700 overflow-hidden animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 text-center border-b border-nora-blue-700 bg-nora-blue-900/50 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-nora-gray-500 hover:text-nora-white hover:bg-nora-blue-700 rounded-full transition-all"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                    <h3 className="text-2xl font-black text-nora-white mb-2 uppercase tracking-tighter">Confirmar Venta</h3>
                    <p className="text-nora-gray-400 text-sm">Monto total a cobrar</p>
                    <div className="text-4xl font-black text-nora-accent-400 mt-2">
                        ₡{total.toLocaleString('es-CR')}
                    </div>
                </div>


                <div className="p-8 space-y-6">
                    <p className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center">Seleccione Método de Pago</p>
                    <div className="grid grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`group p-6 border-2 rounded-3xl flex flex-col items-center transition-all duration-300 active:scale-95
                  ${selectedMethod === method.id
                                        ? 'border-nora-accent-500 bg-nora-accent-500/10'
                                        : 'border-nora-blue-700 hover:border-nora-accent-500/50 hover:bg-nora-accent-500/5'
                                    }`}
                            >
                                <div className={`mb-3 transition-transform ${selectedMethod === method.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {method.icon}
                                </div>
                                <span className={`font-bold text-sm ${selectedMethod === method.id ? 'text-nora-white' : 'text-nora-gray-200 group-hover:text-nora-white'}`}>
                                    {method.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-nora-blue-900/50 flex space-x-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-nora-gray-400 font-bold hover:text-nora-white transition-colors text-sm uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!selectedMethod}
                        onClick={onFinish}
                        className="flex-1 py-4 bg-nora-accent-500 text-nora-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 active:scale-[0.98] transition-all enabled:hover:bg-nora-accent-400 disabled:bg-nora-blue-700 disabled:text-nora-gray-600 uppercase tracking-widest text-sm"
                    >
                        Finalizar
                    </button>
                </div>
            </div>
        </div>
    );
}
