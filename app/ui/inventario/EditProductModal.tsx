'use client';

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import CabysSelector from '../common/CabysSelector';
import { updateRecetaAction } from '@/lib/actions/receta.actions';
import { Receta, CabysItem } from '@/lib/types';
import { useUsuario } from '@/lib/hooks/useUsuario';

interface EditProductModalProps {
    isOpen: boolean;
    product: Receta | null;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIAS = ['comidas', 'bebidas', 'postres', 'snacks', 'desayunos', 'almuerzos', 'cenas', 'otros'];
const FIELD_CLASS = 'w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white focus:ring-2 focus:ring-nora-accent-500 outline-none';
const LABEL_CLASS = 'block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2';

export default function EditProductModal({ isOpen, product, onClose, onSuccess }: EditProductModalProps) {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('0');
    const [categoria, setCategoria] = useState('otros');
    const [selectedCabys, setSelectedCabys] = useState<CabysItem | null>(null);

    useEffect(() => {
        if (product) {
            setNombre(product.nombre);
            setPrecio(String(product.precio));
            setCategoria(product.categoria);
            setSelectedCabys(product.codigo_cabys ? { 
                codigo: product.codigo_cabys, 
                descripcion: '', 
                impuesto: product.impuesto_cabys || 0.13 
            } : null);
            setError(null);
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        setError(null);

        try {
            const response = await updateRecetaAction(product.id, {
                nombre,
                precio: Number(precio),
                categoria,
                codigo_cabys: selectedCabys?.codigo || '',
                impuesto_cabys: selectedCabys?.impuesto || 0.13,
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
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Producto del Menú">
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
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        className={FIELD_CLASS}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={LABEL_CLASS}>Precio (₡)</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="50"
                            value={precio}
                            onChange={e => setPrecio(e.target.value)}
                            className={FIELD_CLASS}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Categoría</label>
                        <select
                            value={categoria}
                            onChange={e => setCategoria(e.target.value)}
                            className={FIELD_CLASS}
                        >
                            {CATEGORIAS.map(cat => (
                                <option key={cat} value={cat} className="bg-nora-blue-900">{cat.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-nora-blue-800/50 p-4 rounded-3xl border border-nora-blue-700/30">
                    <CabysSelector 
                        value={selectedCabys?.codigo || ''} 
                        onSelect={setSelectedCabys} 
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
                        disabled={loading || loadingUsuario || !isAuthorized}
                        className="flex-[2] px-6 py-4 bg-nora-accent-500 text-white rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all disabled:opacity-50"
                    >
                        {loadingUsuario ? 'Verificando...' : !isAuthorized ? 'No autorizado' : loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
