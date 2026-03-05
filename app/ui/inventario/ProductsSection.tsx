import { useState } from 'react';
import { useRecipes } from '@/app/lib/hooks';
import AddProductModal from './AddProductModal';

export default function ProductsSection() {
    const { recipes: products, loading, error, refresh } = useRecipes();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    return (
        <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-nora-gray-100">Productos del Menú</h3>
                    <p className="text-nora-gray-400 text-sm">Gestiona los artículos que venderás en caja.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-nora-accent-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 cursor-pointer"
                    id="Agregar"
                >
                    + Nuevo Producto
                </button>
            </div>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={refresh}
            />

            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest">Producto</th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nora-blue-700/30">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-nora-gray-500 italic">
                                    No hay productos registrados.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-nora-blue-700/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-nora-gray-100">{product.nombre}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-nora-success bg-nora-success/10 px-2 py-1 rounded-md">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-nora-gray-400 hover:text-nora-accent-400 transition-colors">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button className="p-2 text-nora-gray-400 hover:text-nora-danger transition-colors">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
