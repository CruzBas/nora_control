'use client';

import { useState } from 'react';
import { useRecipes } from '@/lib/hooks/hooks';
import { deleteRecetaAction } from '@/lib/actions/receta.actions';
import { Receta } from '@/lib/types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import { useUsuario } from '@/lib/hooks/useUsuario';

export default function ProductsSection() {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const { recipes: products, loading, error, refresh } = useRecipes();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Receta | null>(null);

    const handleDelete = async (product: Receta) => {
        if (!confirm(`¿Eliminar el producto "${product.nombre}"? Esto también eliminará su receta.`)) return;
        const res = await deleteRecetaAction(product.id);
        if (res.success) {
            await refresh();
        } else {
            alert(`Error al eliminar: ${res.error}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    return (
        <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl sm:text-2xl font-black text-nora-gray-100 uppercase tracking-tight">Productos del Menú</h3>
                    <p className="text-nora-gray-400 text-xs sm:text-sm">Gestiona los artículos que venderás en caja.</p>
                </div>
                {!loadingUsuario && isAuthorized && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto bg-nora-accent-500 text-white px-6 py-4 sm:py-3 rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        id="Agregar"
                    >
                        + Nuevo Producto
                    </button>
                )}
            </div>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refresh}
            />

            <EditProductModal
                isOpen={editingProduct !== null}
                product={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSuccess={() => { refresh(); setEditingProduct(null); }}
            />

            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                            <tr>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest whitespace-nowrap">Producto</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center whitespace-nowrap">Categoría</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-center whitespace-nowrap">Precio</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-right whitespace-nowrap">⚙️</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nora-blue-700/30">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-nora-gray-500 italic text-sm">
                                        No hay productos registrados.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-nora-blue-700/10 transition-colors group">
                                        <td className="px-5 sm:px-6 py-4">
                                            <span className="text-xs sm:text-sm font-bold text-nora-gray-100 whitespace-nowrap">{product.nombre}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-center">
                                            <span className="text-[10px] font-black bg-nora-blue-700/50 text-nora-gray-300 px-3 py-1 rounded-full uppercase tracking-tighter sm:tracking-normal">
                                                {product.categoria}
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-center text-nowrap">
                                            <span className="text-xs sm:text-sm font-black text-nora-accent-400">
                                                ₡{product.precio.toLocaleString('es-CR')}
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                {!loadingUsuario && isAuthorized && (
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-accent-500 hover:bg-nora-accent-500/10 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                )}
                                                {!loadingUsuario && isAuthorized && (
                                                    <button
                                                        onClick={() => handleDelete(product)}
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
