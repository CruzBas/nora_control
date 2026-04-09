'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { updateInventarioAction } from '@/lib/actions/inventario.actions';
import { useUsuario } from '@/lib/hooks/useUsuario';
import { useProveedores } from '@/lib/hooks/useProveedores';
import { Proveedor } from '@/lib/types';

const supabase = createClient();

interface Ingredient {
    id: string;
    name: string;
    cantidad: number;
    unidad_medida: string;
    minimo: number;
    costo: number;
    proveedor_id?: string;
    cantidad_reorden?: number;
    proveedor?: Proveedor;
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
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const { proveedores } = useProveedores();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState('0');
    const [unidad_medida, setUnidadMedida] = useState('unidades');
    const [minimo, setMinimo] = useState('0');
    const [costo, setCosto] = useState('0');
    const [proveedor_id, setProveedorId] = useState('');
    const [cantidad_reorden, setCantidadReorden] = useState('0');

    useEffect(() => {
        if (ingredient) {
            setNombre(ingredient.name);
            setCantidad(String(ingredient.cantidad));
            setUnidadMedida(ingredient.unidad_medida ?? 'unidades');
            setMinimo(String(ingredient.minimo));
            setCosto(String(ingredient.costo));
            setProveedorId(ingredient.proveedor_id || '');
            setCantidadReorden(String(ingredient.cantidad_reorden || 0));
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
                unidad_medida: unidad_medida,
                minimo: Number(minimo),
                costo: Number(costo),
                proveedor_id: proveedor_id || undefined,
                cantidad_reorden: Number(cantidad_reorden),
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        <label className={LABEL_CLASS}>Unidad</label>
                        <select
                            required
                            value={unidad_medida}
                            onChange={e => setUnidadMedida(e.target.value)}
                            className={FIELD_CLASS}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={LABEL_CLASS}>Proveedor</label>
                        <select
                            value={proveedor_id}
                            onChange={(e) => setProveedorId(e.target.value)}
                            className={FIELD_CLASS}
                        >
                            <option value="">-- Sin Proveedor --</option>
                            {proveedores.map(prov => (
                                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Cantidad a Reordenar</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cantidad_reorden}
                            onChange={(e) => setCantidadReorden(e.target.value)}
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
