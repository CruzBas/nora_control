'use client';

import { TrashIcon, ShoppingCartIcon, MinusIcon, PlusIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Toast from '@/app/ui/ventas/Toast';

interface CartItem {
    id: string;
    name: string;
    price: number;
    category: string;
    quantity: number;
}

interface CartAsideProps {
    items: CartItem[];
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
    onClear: () => void;
    onCheckout: () => void;
    subtotal: number;
    total: number;
    showToast: boolean;
}

export default function CartAside({
    items,
    onRemove,
    onUpdateQuantity,
    onClear,
    onCheckout,
    subtotal,
    total,
    showToast
}: CartAsideProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside className={`
      bg-nora-blue-800 border-t lg:border-t-0 lg:border-l border-nora-blue-700 flex flex-col relative z-40 transition-all duration-300
      w-full lg:w-96
      ${isExpanded ? 'h-[80vh] lg:h-full' : 'h-20 lg:h-full'}
    `}>
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 lg:p-6 border-b border-nora-blue-700 flex justify-between items-center bg-nora-blue-900/40 cursor-pointer lg:cursor-default"
            >
                <div className="flex items-center space-x-2">
                    <ShoppingCartIcon className="h-5 w-5 text-nora-accent-400" />
                    <h2 className="text-sm lg:text-lg font-black text-nora-white uppercase tracking-tight">Orden Actual</h2>
                    <span className="ml-2 bg-nora-accent-500 text-nora-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                </div>

                <div className="flex items-center space-x-4">

                    {!isExpanded && (
                        <span className="lg:hidden font-black text-nora-accent-400">
                            ₡{total.toLocaleString('es-CR')}
                        </span>
                    )}

                    <div className="flex items-center">
                        {items.length > 0 && isExpanded && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onClear(); }}
                                className="mr-4 text-[10px] font-black text-nora-danger hover:text-red-400 uppercase tracking-widest px-3 py-1 bg-nora-danger/10 rounded-full transition-all"
                            >
                                Vaciar
                            </button>
                        )}
                        <ChevronUpIcon className={`h-5 w-5 text-nora-gray-400 lg:hidden transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>


            <div className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar ${!isExpanded ? 'hidden lg:block' : 'block'}`}>
                {items.length === 0 ? (
                    <div className="text-center py-10 lg:py-20 text-nora-gray-500">
                        <div className="text-4xl lg:text-6xl mb-6 opacity-20 filter grayscale">🛒</div>
                        <p className="font-bold text-nora-gray-300">Tu carrito está vacío</p>
                        <p className="text-xs mt-2 text-nora-gray-500">Agrega productos para comenzar</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center p-3 bg-linear-to-r from-nora-blue-900/40 to-nora-blue-900/60 rounded-2xl border border-nora-blue-700 group hover:border-nora-accent-500/50 transition-all animate-in slide-in-from-right-2 duration-200"
                        >
                            <div className="w-10 h-10 bg-nora-blue-800 rounded-xl flex items-center justify-center text-xl mr-3 shadow-lg">
                                {item.category === 'drinks' ? '🥤' : item.category === 'food' ? '🍔' : '🍱'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-nora-white truncate">{item.name}</h4>
                                <p className="text-[10px] text-nora-accent-400 font-black">₡{item.price.toLocaleString('es-CR')}</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-nora-blue-800 rounded-lg p-1 border border-nora-blue-700 shadow-inner">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center text-nora-gray-400 hover:text-nora-white hover:bg-nora-blue-600 rounded transition-colors"
                                >
                                    <MinusIcon className="h-3 w-3" />
                                </button>
                                <span className="text-[10px] font-black text-nora-white w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center text-nora-gray-400 hover:text-nora-white hover:bg-nora-blue-600 rounded transition-colors"
                                >
                                    <PlusIcon className="h-3 w-3" />
                                </button>
                            </div>
                            <button
                                onClick={() => onRemove(item.id)}
                                className="ml-2 p-2 text-nora-gray-500 hover:text-nora-danger rounded-lg transition-colors"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>


            <div className={`
        p-6 border-t border-nora-blue-700 bg-linear-to-b from-nora-blue-800 to-nora-blue-900 space-y-4 shadow-[0_-15px_40px_rgba(0,0,0,0.3)]
        ${!isExpanded ? 'hidden lg:block' : 'block'}
      `}>
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-nora-gray-400 text-xs font-medium tracking-wide">Subtotal</span>
                        <span className="font-bold text-nora-gray-200 text-sm">₡{subtotal.toLocaleString('es-CR')}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-nora-gray-400 text-xs font-medium tracking-wide">IVA (13%)</span>
                        <span className="font-bold text-nora-gray-200 text-sm">₡{(total - subtotal).toLocaleString('es-CR')}</span>
                    </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-nora-blue-600 to-transparent w-full opacity-50" />

                <div className="flex justify-between items-center px-1 py-1">
                    <span className="text-nora-white font-black uppercase text-[10px] tracking-[0.2em] opacity-80">Total</span>
                    <span className="text-2xl font-black text-nora-accent-400 drop-shadow-[0_0_12px_rgba(209,122,34,0.4)]">
                        ₡{total.toLocaleString('es-CR')}
                    </span>
                </div>

                <button
                    disabled={items.length === 0}
                    onClick={onCheckout}
                    className="w-full py-4.5 bg-linear-to-r from-nora-accent-600 to-nora-accent-500 hover:from-nora-accent-500 hover:to-nora-accent-400 disabled:from-nora-blue-800 disabled:to-nora-blue-900 disabled:border disabled:border-nora-blue-700 disabled:text-nora-gray-600 text-nora-white font-black rounded-2xl shadow-xl shadow-nora-accent-500/20 active:scale-[0.98] transition-all uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 group"
                >
                    <span>Confirmar Orden</span>
                    <ShoppingCartIcon className="h-4 w-4 group-enabled:animate-bounce" />
                </button>
            </div>

            <Toast show={showToast} message="¡Venta registrada con éxito!" />
        </aside>
    );
}
