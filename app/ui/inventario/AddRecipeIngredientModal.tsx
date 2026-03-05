'use client';

import { useState } from 'react';
import Modal from '../common/Modal';
import { addIngredientToRecetaAction } from '@/lib/actions/receta.actions';
import { Inventario } from '@/lib/types';

interface AddRecipeIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    recetaId: string;
    inventory: Inventario[];
}

export default function AddRecipeIngredientModal({
    isOpen,
    onClose,
    onSuccess,
    recetaId,
    inventory
}: AddRecipeIngredientModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            receta_id: recetaId,
            inventario_id: formData.get('inventario_id') as string,
            cantidad: Number(formData.get('cantidad'))
        };

        try {
            const response = await addIngredientToRecetaAction(data);
            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Vincular Ingrediente a Receta">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/20 rounded-xl text-nora-danger text-sm font-bold">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                        Seleccionar Ingrediente
                    </label>
                    <select
                        required
                        name="inventario_id"
                        className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none appearance-none"
                    >
                        <option value="">Elegir uno...</option>
                        {inventory.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.producto} ({item.unidad_medida})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                        Cantidad necesaria
                    </label>
                    <input
                        required
                        type="number"
                        name="cantidad"
                        step="0.01"
                        placeholder="Ej. 0.5"
                        className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none"
                    />
                </div>
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-4 bg-nora-blue-700/30 text-nora-gray-300 rounded-2xl font-bold hover:bg-nora-blue-700/50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] px-6 py-4 bg-nora-accent-500 text-white rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Vinculando...' : 'Agregar a Receta'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
