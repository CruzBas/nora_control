'use client';

import { useState, useEffect } from 'react';
import { useRecipes } from '@/lib/hooks/hooks';
import { addIngredientToRecetaAction, removeIngredientFromRecetaAction } from '@/lib/actions/receta.actions';
import { useUsuario } from '@/lib/hooks/useUsuario';

export default function RecipesSection() {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const {
        recipes,
        inventory,
        selectedIngredients,
        loading,
        loadingIngredients,
        fetchRecipeIngredients
    } = useRecipes();

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [addingIngredient, setAddingIngredient] = useState(false);
    const [savedRecipe, setSavedRecipe] = useState(false);

    const handleSaveRecipe = async () => {
        if (!selectedProductId) return;
        setSavedRecipe(true);
        await fetchRecipeIngredients(selectedProductId);
        setTimeout(() => setSavedRecipe(false), 2500);
    };

    useEffect(() => {
        if (selectedProductId) {
            fetchRecipeIngredients(selectedProductId);
        }
    }, [selectedProductId]);

    const handleAddIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedProductId) return;

        setAddingIngredient(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = {
            receta_id: selectedProductId,
            inventario_id: formData.get('inventario_id') as string,
            cantidad: Number(formData.get('cantidad'))
        };

        try {
            const res = await addIngredientToRecetaAction(data);
            if (res.success) {
                await fetchRecipeIngredients(selectedProductId);
                form.reset();
            } else {
                alert(res.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAddingIngredient(false);
        }
    };

    const handleDeleteIngredient = async (id: string) => {
        if (!confirm('¿Eliminar este ingrediente de la receta?')) return;

        try {
            const res = await removeIngredientFromRecetaAction(id);
            if (res.success && selectedProductId) {
                await fetchRecipeIngredients(selectedProductId);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-2xl font-black text-nora-gray-100">Gestión de Recetas</h3>
                <p className="text-nora-gray-400 text-sm">Vincula productos con sus ingredientes para descuento automático.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-1 bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 p-6 space-y-4 backdrop-blur-sm">
                    <h4 className="font-bold text-nora-gray-100 border-b border-nora-blue-700/50 pb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-nora-accent-400">restaurant_menu</span>
                        Seleccionar Producto
                    </h4>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-nora-accent-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {recipes.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProductId(p.id)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border ${selectedProductId === p.id
                                        ? 'bg-nora-accent-500/20 border-nora-accent-500 text-nora-accent-400 shadow-lg shadow-nora-accent-500/10'
                                        : 'bg-nora-blue-900/40 border-nora-blue-700/30 text-nora-gray-300 hover:border-nora-blue-600'
                                        }`}
                                >
                                    <p className="font-bold uppercase tracking-wider text-xs mb-1">Producto</p>
                                    <p className="font-black text-sm">{p.nombre}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                <div className="md:col-span-2 bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 p-8 flex flex-col backdrop-blur-sm min-h-[400px]">
                    {!selectedProductId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-nora-gray-500 space-y-4">
                            <div className="w-20 h-20 bg-nora-blue-700/20 rounded-full flex items-center justify-center text-4xl">📖</div>
                            <p className="font-medium max-w-xs">Selecciona un producto a la izquierda para configurar su receta.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-nora-blue-900/40 p-4 rounded-2xl border border-nora-blue-700/30">
                                <h4 className="text-xl font-black text-nora-gray-100">
                                    {recipes.find(p => p.id === selectedProductId)?.nombre}
                                </h4>
                                {!loadingUsuario && isAuthorized && (
                                    <button
                                        onClick={handleSaveRecipe}
                                        disabled={savedRecipe}
                                        className={`px-6 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 ${savedRecipe
                                            ? 'bg-nora-success text-white shadow-nora-success/20 cursor-default'
                                            : 'bg-nora-accent-500 hover:bg-nora-accent-400 text-white shadow-nora-accent-500/20'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {savedRecipe ? 'check_circle' : 'save'}
                                        </span>
                                        {savedRecipe ? 'Guardado' : 'Guardar Receta'}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {!loadingUsuario && isAuthorized && (
                                    <form onSubmit={handleAddIngredient} className="flex gap-3">
                                        <select
                                            name="inventario_id"
                                            required
                                            className="flex-1 p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-nora-gray-200 focus:ring-2 focus:ring-nora-accent-500 outline-none appearance-none"
                                        >
                                            <option value="">Seleccionar ingrediente...</option>
                                            {inventory.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.producto} ({item.unidad_medida})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            name="cantidad"
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="Cant."
                                            className="w-24 p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-nora-gray-200 text-center outline-none focus:ring-2 focus:ring-nora-accent-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={addingIngredient}
                                            className="bg-nora-accent-500/10 text-nora-accent-400 p-4 rounded-2xl font-black hover:bg-nora-accent-500/20 transition-all disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">{addingIngredient ? 'hourglass_empty' : 'add'}</span>
                                        </button>
                                    </form>
                                )}

                                <div className="bg-nora-blue-900/20 border border-nora-blue-700/30 rounded-2xl overflow-hidden mt-4">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-nora-blue-900/40 border-b border-nora-blue-700/50">
                                            <tr>
                                                <th className="px-6 py-3 font-bold text-nora-gray-400">Ingrediente</th>
                                                <th className="px-6 py-3 font-bold text-nora-gray-400 text-center">Cantidad</th>
                                                <th className="px-6 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-nora-blue-700/10">
                                            {loadingIngredients ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-10 text-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-nora-accent-500 mx-auto"></div>
                                                    </td>
                                                </tr>
                                            ) : selectedIngredients.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-10 text-center text-nora-gray-500 italic">
                                                        No hay ingredientes agregados a esta receta.
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedIngredients.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4 text-nora-gray-200">
                                                            {item.inventario?.producto || 'Desconocido'}
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-nora-accent-400 font-bold">
                                                            {item.cantidad.toLocaleString('es-CR', { maximumFractionDigits: 3 })} {item.inventario?.unidad_medida}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!loadingUsuario && isAuthorized && (
                                                                <button
                                                                    onClick={() => handleDeleteIngredient(item.id)}
                                                                    className="p-2 text-nora-gray-400 hover:text-nora-danger transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
