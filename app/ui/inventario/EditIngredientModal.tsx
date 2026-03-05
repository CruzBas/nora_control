'use client';

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { updateInventarioAction } from '@/lib/actions/inventario.actions';

interface Ingredient {
    id: string;
    name: string;
    cantidad: number;
    minimo: number;
    costo: number;
}

interface EditIngredientModalProps {
    isOpen: boolean;
    ingredient: Ingredient | null;
    onClose: () => void;
    onSuccess: () => void;
}

const FIELD_CLASS = 'w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none';
const LABEL_CLASS = 'block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2';

export default function EditIngredientModal({ isOpen, ingredient, onClose, onSuccess }: EditIngredientModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Valores del formulario inicializados con los datos del ingrediente
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState('0');
    const [minimo, setMinimo] = useState('0');
    const [costo, setCosto] = useState('0');

    // Sincronizar cuando cambia el ingrediente seleccionado
    useEffect(() => {
        if (ingredient) {
            setNombre(ingredient.name);
            setCantidad(String(ingredient.cantidad));
            setMinimo(String(ingredient.minimo));
            setCosto(String(ingredient.costo));
            setError(null);
        }
    }, [ingredient]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!ingredient) return;

        setLoading(true);
        setError(null);

        try {
            const response = await updateInventarioAction(ingredient.id, {
                producto: nombre,
                cantidad: Number(cantidad),
                minimo: Number(minimo),
                costo: Number(costo),
            });

            if (response.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Ingrediente">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/20 rounded-xl text-nora-danger text-sm font-bold">
                        {error}
                    </div>
                )}

                <div>
                    <label className={LABEL_CLASS}>Nombre del Ingrediente</label>
                    <input
                        required
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        className={FIELD_CLASS}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>Cantidad Actual</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            value={cantidad}
                            onChange={e => setCantidad(e.target.value)}
                            className={FIELD_CLASS}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Mínimo Stock</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            value={minimo}
                            onChange={e => setMinimo(e.target.value)}
                            className={FIELD_CLASS}
                        />
                    </div>
                </div>

                <div>
                    <label className={LABEL_CLASS}>Costo por unidad (¢)</label>
                    <input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={costo}
                        onChange={e => setCosto(e.target.value)}
                        className={FIELD_CLASS}
                    />
                </div>

                <div className="flex gap-3 pt-2">
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
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
