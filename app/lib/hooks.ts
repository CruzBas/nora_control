import { useState, useEffect } from 'react';
import { api } from './api';

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
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await api.get('/orden');

            // Map backend data to frontend interface
            const mappedOrders: Order[] = data.map((o: any) => ({
                id: o.id.substring(0, 5).toUpperCase(), // Simplified ID for UI
                table: o.cliente || 'Mesa',
                client: o.cliente || 'Anónimo',
                total: o.total || 0,
                time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'pending',
                items: o.detalle_orden.map((d: any) => ({
                    name: d.receta?.nombre || 'Producto',
                    quantity: d.cantidad,
                    notes: '',
                }))
            }));

            setOrders(mappedOrders);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsCompleted = async (id: string) => {
        // Here you would call the API to update the status in the DB
        // For now, we'll just remove it from the state
        setOrders(prev => prev.filter(order => order.id !== id));
    };

    return { orders, loading, error, refresh: fetchOrders, markAsCompleted };
}

export interface Ingredient {
    id: string;
    name: string;
    stock: number;
    min: number;
    unit: string;
}

export function useInventory() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await api.get('/inventario');

            const mappedIngredients: Ingredient[] = data.map((i: any) => ({
                id: i.id,
                name: i.producto,
                stock: i.cantidad,
                min: i.minimo || 0,
                unit: 'unid', // You might want to add unit to DB
            }));

            setIngredients(mappedIngredients);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching inventory:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return { ingredients, loading, error, refresh: fetchInventory };
}
