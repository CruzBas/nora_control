import { useState, useEffect } from 'react';

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
        // Sin backend: mantenemos el mock
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const markAsCompleted = async (id: string) => {
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
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: '1', name: 'Carne de Res', stock: 50, min: 20, unit: 'kg' },
        { id: '2', name: 'Pan de Hamburguesa', stock: 15, min: 30, unit: 'unid' }, // low stock
        { id: '3', name: 'Queso Cheddar', stock: 40, min: 15, unit: 'laminas' },
        { id: '4', name: 'Tomate', stock: 5, min: 10, unit: 'kg' }, // low stock
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInventory = async () => {
        // Sin backend: mantenemos el mock
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return { ingredients, loading, error, refresh: fetchInventory };
}
