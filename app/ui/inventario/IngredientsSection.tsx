import { useState } from 'react';
import { useInventory } from '@/app/lib/hooks';
import AddIngredientModal from './AddIngredientModal';

interface AgregarProps {
    showAgregar?: boolean;
}

export default function IngredientsSection({
    showAgregar = true
}: AgregarProps) {
    const { ingredients, loading, error, deleteIngredient, refresh } = useInventory();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-black text-nora-gray-100">Ingredientes</h3>
                    <p className="text-nora-gray-400 text-sm">Controla tus materias primas y existencias.</p>
                </div>
                {showAgregar && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-nora-accent-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 cursor-pointer"
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

            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest whitespace-nowrap">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Cantidad</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Mínimo</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Costo (¢)</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nora-blue-700/30">
                            {ingredients.map((item) => (
                                <tr key={item.id} className="hover:bg-nora-blue-700/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-nora-gray-100 whitespace-nowrap">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${item.cantidad <= item.minimo
                                            ? 'bg-nora-danger/20 text-nora-danger'
                                            : 'bg-nora-success/20 text-nora-success'
                                            }`}>
                                            {item.cantidad}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-nora-gray-400 whitespace-nowrap">{item.minimo}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-nora-accent-400 whitespace-nowrap">¢{item.costo.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-nora-gray-400 hover:text-nora-accent-400 transition-colors">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => deleteIngredient(item.id)}
                                                className="p-2 text-nora-gray-400 hover:text-nora-danger transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
