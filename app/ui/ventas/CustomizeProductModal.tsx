'use client';

import { useState } from 'react';
import Modal from '../common/Modal';
import { Inventario } from '@/lib/types';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Extra {
    inventario_id: string;
    nombre: string;
    precio: number;
}

interface CustomizeProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        price: number;
    } | null;
    insumos: Inventario[];
    onConfirm: (data: { quantity: number; notes: string; extras: Extra[] }) => void;
}

export default function CustomizeProductModal({
    isOpen,
    onClose,
    product,
    insumos,
    onConfirm
}: CustomizeProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInsumos = insumos.filter(insumo => 
        insumo.producto.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const handleAddExtra = (insumo: Inventario) => {
        if (selectedExtras.find(e => e.inventario_id === insumo.id)) return;
        setSelectedExtras([...selectedExtras, {
            inventario_id: insumo.id,
            nombre: insumo.producto,
            precio: insumo.costo * 2 // Using a multiplier as a place holder for extra price, or maybe user wants to set it?
            // Actually, let's just use a default extra price or let the user see it.
        }]);
    };

    const handleUpdateExtraPrice = (id: string, price: number) => {
        setSelectedExtras(selectedExtras.map(e => e.inventario_id === id ? { ...e, precio: isNaN(price) ? 0 : price } : e));
    };

    const handleRemoveExtra = (id: string) => {
        setSelectedExtras(selectedExtras.filter(e => e.inventario_id !== id));
    };

    const handleConfirm = () => {
        onConfirm({ quantity, notes, extras: selectedExtras });
        // Reset state
        setQuantity(1);
        setNotes('');
        setSelectedExtras([]);
        setSearchTerm('');
        onClose();
    };

    const totalPrice = (product?.price || 0) + selectedExtras.reduce((acc, e) => acc + e.precio, 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Personalizar ${product?.name}`}>
            <div className="space-y-6 pb-2">
                {/* Cantidad */}
                <div className="bg-nora-blue-900/40 p-4 rounded-2xl border border-nora-blue-700/50">
                    <label className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest block mb-3">Cantidad</label>
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 rounded-xl bg-nora-blue-800 border border-nora-blue-700 flex items-center justify-center text-white hover:bg-nora-blue-700 transition-colors"
                        >
                            <MinusIcon className="h-6 w-6" />
                        </button>
                        <span className="text-2xl font-black text-white w-8 text-center">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-12 rounded-xl bg-nora-blue-800 border border-nora-blue-700 flex items-center justify-center text-white hover:bg-nora-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Notas */}
                <div className="bg-nora-blue-900/40 p-4 rounded-2xl border border-nora-blue-700/50">
                    <label className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest block mb-3">Instrucciones Especiales</label>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: Sin cebolla, término medio, etc..."
                        className="w-full bg-nora-blue-800 border border-nora-blue-700 rounded-xl p-3 text-sm text-white placeholder:text-nora-gray-600 focus:outline-none focus:border-nora-accent-500 min-h-[80px] resize-none"
                    />
                </div>

                {/* Insumos / Extras */}
                <div className="bg-nora-blue-900/40 p-4 rounded-2xl border border-nora-blue-700/50">
                    <label className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest block mb-3">Insumos Extras</label>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar insumo..."
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 rounded-xl p-3 pl-10 text-xs text-white placeholder:text-nora-gray-600 focus:outline-none focus:border-nora-accent-500"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-nora-gray-500 text-sm">search</span>
                    </div>

                    {/* Results */}
                    {searchTerm && filteredInsumos.length > 0 && (
                        <div className="space-y-1 mb-4">
                            {filteredInsumos.map(insumo => (
                                <button
                                    key={insumo.id}
                                    onClick={() => handleAddExtra(insumo)}
                                    className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-nora-blue-800 text-left text-xs text-nora-gray-300 transition-colors border border-transparent hover:border-nora-blue-700"
                                >
                                    <span>{insumo.producto}</span>
                                    <span className="text-nora-accent-400 font-bold">+ Agregar</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected Extras */}
                    <div className="space-y-2">
                        {selectedExtras.map(extra => (
                            <div key={extra.inventario_id} className="flex justify-between items-center p-3 bg-nora-blue-800 rounded-2xl border border-nora-blue-700 shadow-sm animate-in slide-in-from-top-1">
                                <div className="flex flex-col flex-1 min-w-0 mr-4">
                                    <span className="text-xs font-bold text-white truncate">{extra.nombre}</span>
                                    <span className="text-[10px] text-nora-gray-500 font-black uppercase tracking-widest mt-0.5">Precio Extra</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nora-accent-400 font-black text-xs">₡</span>
                                        <input 
                                            type="number"
                                            value={extra.precio}
                                            onChange={(e) => handleUpdateExtraPrice(extra.inventario_id, parseInt(e.target.value))}
                                            className="w-24 bg-nora-blue-900/50 border border-nora-blue-700 rounded-xl p-2 pl-7 text-xs text-white font-black focus:outline-none focus:border-nora-accent-500"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveExtra(extra.inventario_id)}
                                        className="p-2 text-nora-gray-500 hover:text-nora-danger transition-colors bg-nora-blue-900/50 rounded-xl"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {selectedExtras.length === 0 && !searchTerm && (
                            <p className="text-center text-[10px] text-nora-gray-600 py-2">No se han añadido insumos extras</p>
                        )}
                    </div>
                </div>

                {/* Total and Confirm */}
                <div className="pt-4 border-t border-nora-blue-700 flex flex-col items-center">
                    <div className="flex justify-between w-full mb-4 px-2">
                        <span className="text-sm font-black text-white uppercase tracking-widest">Total Unitario</span>
                        <span className="text-lg font-black text-nora-accent-400">₡{totalPrice.toLocaleString('es-CR')}</span>
                    </div>
                    <button 
                        onClick={handleConfirm}
                        className="w-full py-4 bg-nora-accent-500 text-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    >
                        Agregar a la Orden
                    </button>
                </div>
            </div>
        </Modal>
    );
}
