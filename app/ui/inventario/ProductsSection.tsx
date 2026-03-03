'use client';

interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
}

interface ProductsSectionProps {
    products?: Product[];
}

export default function ProductsSection({
    products = [
        { id: '1', name: 'Café Americano', category: 'Bebidas Calientes', price: '₡1,500' },
        { id: '2', name: 'Capuchino', category: 'Bebidas Calientes', price: '₡2,200' },
        { id: '3', name: 'Tarta de Limón', category: 'Repostería', price: '₡1,800' },
    ]
}: ProductsSectionProps) {
    return (
        <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-nora-gray-100">Productos del Menú</h3>
                    <p className="text-nora-gray-400 text-sm">Gestiona los artículos que venderás en caja.</p>
                </div>
                <button className="bg-nora-accent-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 cursor-pointer" id="Agregar">
                    + Nuevo Producto
                </button>
            </div>

            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest">Producto</th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest">Categoría</th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-right">Precio Venta</th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nora-blue-700/30">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-nora-blue-700/20 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-nora-gray-100">{product.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-nora-gray-400 bg-nora-blue-700/30 px-2 py-1 rounded-md">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-bold text-nora-success">{product.price}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-nora-gray-400 hover:text-nora-accent-400 transition-colors">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button className="p-2 text-nora-gray-400 hover:text-nora-danger transition-colors">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
