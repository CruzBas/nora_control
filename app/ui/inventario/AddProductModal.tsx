'use client';

import { useState } from 'react';
import Modal from '../common/Modal';
import { createRecetaAction } from '@/lib/actions/receta.actions';
import { useUsuario } from '@/lib/hooks/useUsuario';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIAS = ['comidas', 'bebidas', 'postres', 'snacks', 'desayunos', 'almuerzos', 'cenas', 'otros'];

const FIELD_CLASS = 'w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none';
const LABEL_CLASS = 'block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2';

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
            nombre: formData.get('nombre') as string,
            precio: Number(formData.get('precio')),
            categoria: formData.get('categoria') as string,
        };

        try {
            const response = await createRecetaAction(data);
            if (response.success) {
                form.reset();
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
        <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Producto al Menú">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-nora-danger/10 border border-nora-danger/20 rounded-xl text-nora-danger text-sm font-bold">
                        {error}
                    </div>
                )}


                <div>
                    <label className={LABEL_CLASS}>Nombre del Producto</label>
                    <input
                        required
                        name="nombre"
                        placeholder="Ej. Café Americano"
                        className={FIELD_CLASS}
                    />
                </div>


                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={LABEL_CLASS}>Precio (₡)</label>
                        <input
                            required
                            name="precio"
                            type="number"
                            min="0"
                            step="50"
                            placeholder="Ej. 2500"
                            className={FIELD_CLASS}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Categoría</label>
                        <select
                            required
                            name="categoria"
                            className={`${FIELD_CLASS} appearance-none`}
                            defaultValue=""
                        >
                            <option value="" disabled>Seleccionar...</option>
                            {CATEGORIAS.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <p className="text-xs text-nora-gray-500 pt-1">
                    💡 Después de crear el producto, ve a <strong className="text-nora-gray-400">Recetas</strong> para vincular sus ingredientes.
                </p>

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
                        disabled={loading || loadingUsuario || !isAuthorized}
                        className="flex-[2] px-6 py-4 bg-nora-accent-500 text-white rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all disabled:opacity-50"
                    >
                        {loadingUsuario ? 'Verificando...' : !isAuthorized ? 'No autorizado' : loading ? 'Guardando...' : 'Crear Producto'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
