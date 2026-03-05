import { useState, useEffect } from 'react';
//Datos quemados
export interface OrderItem {
    name: string;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    table: string;
    client: string;
    total: number;
    time: string;
    items: OrderItem[];
    status: 'pending' | 'completed';
}

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([
        {
            id: 'ORD-001',
            table: 'Mesa 3',
            client: 'Juan',
            total: 12500,
            time: '14:30',
            status: 'pending',
            items: [
                { name: 'Hamburguesa Clásica', quantity: 2, notes: 'Sin cebolla' },
                { name: 'Papas Fritas', quantity: 1 }
            ]
        },
        {
            id: 'ORD-002',
            table: 'Mesa 5',
            client: 'María',
            total: 8900,
            time: '14:45',
            status: 'pending',
            items: [
                { name: 'Ensalada César', quantity: 1 },
                { name: 'Limonada', quantity: 1 }
            ]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {

    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsCompleted = async (id: string) => {
        setOrders(prev => prev.filter(order => order.id !== id));
    };

    return { orders, loading, error, refresh: fetchOrders, markAsCompleted };
}

//Inventario
export interface Ingredient {
    id: string;
    name: string;
    cantidad: number;
    minimo: number;
    costo: number;
}

import { getInventarioAction, deleteInventarioAction } from '@/lib/actions/inventario.actions';

export function useInventory() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await getInventarioAction();
            if (response.success && response.data) {
                const mappedData: Ingredient[] = response.data.map(item => ({
                    id: item.id,
                    name: item.producto,
                    cantidad: item.cantidad,
                    minimo: item.minimo,
                    costo: item.costo
                }));
                setIngredients(mappedData);
                setError(null);
            } else {
                setError(response.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar inventario');
        } finally {
            setLoading(false);
        }
    };

    const deleteIngredient = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este ingrediente?')) return;

        try {
            const response = await deleteInventarioAction(id);
            if (response.success) {
                await fetchInventory();
            } else {
                alert(`Error al eliminar: ${response.error}`);
            }
        } catch (err) {
            alert('Error inesperado al eliminar');
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return { ingredients, loading, error, refresh: fetchInventory, deleteIngredient };
}
//Recetas

import { getRecetasAction, getRecetaIngredientsAction } from '@/lib/actions/receta.actions';
import { Receta, RecetaProducto, Inventario } from '@/lib/types';

export function useRecipes() {
    const [recipes, setRecipes] = useState<Receta[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<RecetaProducto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingIngredients, setLoadingIngredients] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [inventory, setInventory] = useState<Inventario[]>([]);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const [recipesRes, inventoryRes] = await Promise.all([
                getRecetasAction(),
                getInventarioAction()
            ]);

            if (recipesRes.success && recipesRes.data) {
                setRecipes(recipesRes.data);
                setError(null);
            } else {
                setError(recipesRes.error);
            }

            if (inventoryRes.success && inventoryRes.data) {
                setInventory(inventoryRes.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipeIngredients = async (recetaId: string) => {
        setLoadingIngredients(true);
        try {
            const response = await getRecetaIngredientsAction(recetaId);
            if (response.success && response.data) {
                setSelectedIngredients(response.data);
            } else {
                console.error(response.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingIngredients(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    return {
        recipes,
        inventory,
        selectedIngredients,
        loading,
        loadingIngredients,
        error,
        refresh: fetchRecipes,
        fetchRecipeIngredients
    };
}
