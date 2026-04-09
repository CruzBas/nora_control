'use client';

import { useState } from 'react';
import { useInventory } from '@/lib/hooks/hooks';
import AddIngredientModal from './AddIngredientModal';
import EditIngredientModal from './EditIngredientModal';
import AlertasReabastecimiento from './AlertasReabastecimiento';
import { useUsuario } from '@/lib/hooks/useUsuario';

interface AgregarProps {
    showAgregar?: boolean;
}


interface Ingredient {
    id: string;
    name: string;
    cantidad: number;
    unidad_medida: string;
    minimo: number;
    costo: number;
    proveedor_id?: string;
    cantidad_reorden?: number;
    proveedor?: any;
}

export default function IngredientsSection({
    showAgregar = true
}: AgregarProps) {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const { ingredients, loading, error, deleteIngredient, refresh } = useInventory();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-nora-danger/10 border border-nora-danger/20 rounded-3xl">
                <p className="text-nora-danger font-bold">Error: {error}</p>
            </div>
        );
    }

    return (
        <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-nora-gray-100 uppercase tracking-tight">Ingredientes</h3>
                    <p className="text-nora-gray-400 text-xs sm:text-sm">Controla tus materias primas y existencias.</p>
                </div>
                {showAgregar && !loadingUsuario && isAuthorized && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-nora-accent-500 text-white px-6 py-4 sm:py-3 rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                    >
                        + Nuevo Ingrediente
                    </button>
                )}
            </div>

            <AddIngredientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refresh}
            />

            <EditIngredientModal
                isOpen={editingIngredient !== null}
                ingredient={editingIngredient}
                onClose={() => setEditingIngredient(null)}
                onSuccess={() => { refresh(); setEditingIngredient(null); }}
            />

            <AlertasReabastecimiento />

            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                            <tr>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest whitespace-nowrap">Nombre</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center whitespace-nowrap">Stock</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center whitespace-nowrap">Mínimo</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center whitespace-nowrap">Costo (¢)</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-right whitespace-nowrap">⚙️</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nora-blue-700/30">
                            {ingredients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-nora-gray-500 italic text-sm">
                                        No hay ingredientes registrados.
                                    </td>
                                </tr>
                            ) : (
                                ingredients.map((item) => (
                                    <tr key={item.id} className="hover:bg-nora-blue-700/10 transition-colors group">
                                        <td className="px-5 sm:px-6 py-4">
                                            <span className="text-xs sm:text-sm font-bold text-nora-gray-100 whitespace-nowrap">{item.name}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-center">
                                            <span className={`text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full whitespace-nowrap uppercase ${item.cantidad <= item.minimo
                                                ? 'bg-nora-danger/20 text-nora-danger'
                                                : 'bg-nora-success/10 text-nora-success'
                                                }`}>
                                                {item.cantidad.toLocaleString('es-CR', { maximumFractionDigits: 3 })} {item.unidad_medida}
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-center">
                                            <span className="text-xs text-nora-gray-400 whitespace-nowrap">{item.minimo.toLocaleString('es-CR', { maximumFractionDigits: 3 })} {item.unidad_medida}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-center">
                                            <span className="text-xs sm:text-sm font-black text-nora-accent-400 whitespace-nowrap">₡{item.costo.toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!loadingUsuario && isAuthorized && (
                                                    <button
                                                        onClick={() => setEditingIngredient(item)}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-accent-500 hover:bg-nora-accent-500/10 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                )}
                                                {!loadingUsuario && isAuthorized && (
                                                    <button
                                                        onClick={() => deleteIngredient(item.id)}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-danger hover:bg-nora-danger/10 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
