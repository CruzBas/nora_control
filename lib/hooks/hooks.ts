import { useState, useEffect } from 'react';

export interface OrderItem {
    name: string;
    quantity: number;
    notes?: string;
    receta_id?: string; // ID de la receta para descontar inventario automáticamente
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
        // TODO: Conectar con órdenes reales de Supabase
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsCompleted = async (id: string) => {
        // Buscar la orden para obtener sus ítems con receta_id
        const order = orders.find(o => o.id === id);

        // Descontar inventario si los ítems tienen receta_id
        if (order) {
            const itemsWithReceta = order.items
                .filter(item => item.receta_id)
                .map(item => ({ receta_id: item.receta_id!, quantity: item.quantity }));

            if (itemsWithReceta.length > 0) {
                try {
                    await completeOrderAndDeductInventoryAction(itemsWithReceta);
                } catch (err) {
                    console.error('Error al descontar inventario:', err);
                }
            }
        }

        // Quitar la orden de la lista local
        setOrders(prev => prev.filter(order => order.id !== id));
    };

    return { orders, loading, error, refresh: fetchOrders, markAsCompleted };
}

//Inventario
export interface Ingredient {
    id: string;
    name: string;
    cantidad: number;
    unidad_medida: string;
    minimo: number;
    costo: number;
    proveedor_id?: string;
    cantidad_reorden?: number;
    proveedor?: any;
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
                    unidad_medida: item.unidad_medida,
                    minimo: item.minimo,
                    costo: item.costo,
                    proveedor_id: item.proveedor_id,
                    cantidad_reorden: item.cantidad_reorden,
                    proveedor: item.proveedor
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

import { getRecetasAction, getRecetaIngredientsAction, getRecetasForPOSAction } from '@/lib/actions/receta.actions';
import { completeOrderAndDeductInventoryAction } from '@/lib/actions/orden.actions';
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

// POS — productos disponibles para vender (recetas con al menos 1 ingrediente)
export function usePOSProducts() {
    const [products, setProducts] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getRecetasForPOSAction();
            if (response.success && response.data) {
                setProducts(response.data);
                setError(null);
            } else {
                setError(response.error ?? 'Error al cargar productos');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, error, refresh: fetchProducts };
}
