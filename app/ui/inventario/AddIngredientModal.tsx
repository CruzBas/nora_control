'use client';

import { useState } from 'react';
import Modal from '../common/Modal';
import { createInventarioAction } from '@/lib/actions/inventario.actions';
import { useUsuario } from '@/lib/hooks/useUsuario';

interface AddIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddIngredientModal({ isOpen, onClose, onSuccess }: AddIngredientModalProps) {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            producto: formData.get('producto') as string,
            cantidad: Number(formData.get('cantidad')),
            unidad_medida: formData.get('unidad_medida') as string,
            minimo: Number(formData.get('minimo')),
            costo: Number(formData.get('costo'))
        };

        try {
            const response = await createInventarioAction(data);
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
        <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Ingrediente">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/20 rounded-xl text-nora-danger text-sm font-bold">
                        {error}
                    </div>
                )}
                <div>
                    <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                        Nombre del Producto
                    </label>
                    <input
                        required
                        name="producto"
                        placeholder="Ej. Grano de Café"
                        className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none"
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                            Cantidad Inicial
                        </label>
                        <input
                            required
                            type="number"
                            name="cantidad"
                            step="0.01"
                            defaultValue="0"
                            className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                            Unidad
                        </label>
                        <select
                            required
                            name="unidad_medida"
                            defaultValue="unidades"
                            className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none"
                        >
                            <option value="unidades">Unidades (uds)</option>
                            <option value="kg">Kilogramos (kg)</option>
                            <option value="g">Gramos (g)</option>
                            <option value="L">Litros (L)</option>
                            <option value="ml">Mililitros (ml)</option>
                            <option value="lb">Libras (lb)</option>
                            <option value="oz">Onzas (oz)</option>
                            <option value="paquetes">Paquetes</option>
                            <option value="cajas">Cajas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                            Mínimo Stock
                        </label>
                        <input
                            required
                            type="number"
                            name="minimo"
                            step="0.01"
                            defaultValue="0"
                            className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                        Costo por unidad (¢)
                    </label>
                    <input
                        required
                        type="number"
                        name="costo"
                        step="0.01"
                        placeholder="Ej. 1500"
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
                        disabled={loading || loadingUsuario || !isAuthorized}
                        className="flex-[2] px-6 py-4 bg-nora-accent-500 text-white rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all disabled:opacity-50"
                    >
                        {loadingUsuario ? 'Verificando...' : !isAuthorized ? 'No autorizado' : loading ? 'Guardando...' : 'Guardar Ingrediente'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
