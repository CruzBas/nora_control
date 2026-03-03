'use client';

import { useState } from 'react';
import MetricCard from '@/app/ui/MetricCard';

interface OrderItem {
    name: string;
    quantity: number;
    notes?: string;
}

interface Order {
    id: string;
    table: string;
    time: string;
    items: OrderItem[];
    status: 'pending' | 'completed';
}

const INITIAL_ORDERS: Order[] = [
    {
        id: 'K-201',
        table: 'Mesa 4',
        time: '5 min',
        status: 'pending',
        items: [
            { name: 'Hamburguesa Nora Especial', quantity: 2, notes: 'Sin cebolla en una' },
            { name: 'Papas Fritas Grandes', quantity: 1 }
        ]
    },
    {
        id: 'K-202',
        table: 'Mesa 8',
        time: '12 min',
        status: 'pending',
        items: [
            { name: 'Pizza Pepperoni', quantity: 1, notes: 'Bien tostada' },
            { name: 'Refresco Familiar', quantity: 1 }
        ]
    },
    {
        id: 'K-203',
        table: 'Para Llevar',
        time: '3 min',
        status: 'pending',
        items: [
            { name: 'Ensalada César', quantity: 1 },
            { name: 'Batido de Fresas', quantity: 1, notes: 'Poca azúcar' }
        ]
    },
    {
        id: 'K-204',
        table: 'Mesa 2',
        time: '15 min',
        status: 'pending',
        items: [
            { name: 'Sopa de Mariscos', quantity: 2 },
            { name: 'Arroz con Pollo', quantity: 1, notes: 'Sin culantro' },
            { name: 'Cerveza Nacional', quantity: 3 }
        ]
    }
];

export default function DashboardCocina() {
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const markAsCompleted = (id: string) => {
        setOrders(orders.filter(order => order.id !== id));
        setSelectedOrder(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 group/dashboard p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight flex items-center gap-3">
                        Pedidos en Preparación
                        <span className="bg-nora-accent-500/20 text-nora-accent-400 text-sm py-1 px-3 rounded-full border border-nora-accent-500/30">
                            {orders.length} pendientes
                        </span>
                    </h1>
                    <p className="text-nora-gray-400 mt-1 font-medium">
                        Gestiona las órdenes que deben ser preparadas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer active:scale-95 transition-transform group/card"
                    >
                        <MetricCard
                            title={`${order.table} • #${order.id}`}
                            value={`${order.items.reduce((acc, item) => acc + item.quantity, 0)} ítems`}
                            icon="restaurant"
                            badge={order.time}
                            badgeColorClass={
                                parseInt(order.time) > 10
                                    ? 'bg-nora-danger/20 text-nora-danger border border-nora-danger/30'
                                    : 'bg-nora-accent-500/20 text-nora-accent-400 border border-nora-accent-500/30'
                            }
                            iconBgClass="bg-nora-blue-700/40"
                            iconColorClass="text-nora-gray-300 group-hover/card:text-nora-accent-400 transition-colors"
                            accentBorder={parseInt(order.time) > 10}
                            accentBorderClass="border-l-nora-danger"
                        />
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl animate-in fade-in duration-500">
                        <span className="material-symbols-outlined text-6xl text-nora-blue-700 mb-4">check_circle</span>
                        <p className="text-nora-gray-400 font-bold text-xl">¡Cocina al día!</p>
                        <p className="text-nora-gray-500">No hay pedidos pendientes por ahora.</p>
                    </div>
                )}
            </div>

            {/* Modal de Detalles */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-nora-blue-900/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedOrder(null)}
                    />

                    <div className="relative bg-nora-blue-800 w-full max-w-lg rounded-3xl border border-nora-blue-600 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header del Modal */}
                        <div className="p-6 border-b border-nora-blue-700 flex justify-between items-start bg-nora-blue-900/40">
                            <div>
                                <h2 className="text-2xl font-black text-white">{selectedOrder.table}</h2>
                                <p className="text-nora-accent-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-1">
                                    <span className="material-symbols-outlined text-sm">confirmation_number</span>
                                    Pedido #{selectedOrder.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-nora-blue-700/50 text-nora-gray-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {selectedOrder.items.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 rounded-xl bg-nora-blue-700/30 border border-nora-blue-700/50 group/item">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-nora-accent-500/10 border border-nora-accent-500/20 flex items-center justify-center text-nora-accent-400 font-black text-lg">
                                        {item.quantity}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-nora-gray-100 group-hover/item:text-white transition-colors uppercase tracking-tight">{item.name}</h3>
                                        {item.notes && (
                                            <div className="mt-2 p-2 rounded-lg bg-nora-danger/10 border border-nora-danger/20 flex items-start gap-2">
                                                <span className="material-symbols-outlined text-nora-danger text-[18px]">priority_high</span>
                                                <p className="text-sm font-semibold text-nora-danger leading-tight">
                                                    {item.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer del Modal */}
                        <div className="p-6 bg-nora-blue-900/50 border-t border-nora-blue-700 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 py-4 px-6 rounded-2xl border border-nora-blue-600 text-nora-gray-300 font-bold hover:bg-nora-blue-700 hover:text-white transition-all active:scale-95"
                            >
                                VOLVER
                            </button>
                            <button
                                onClick={() => markAsCompleted(selectedOrder.id)}
                                className="flex-[2] py-4 px-6 rounded-2xl bg-nora-success text-white font-black hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-nora-success/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                MARCAR COMPLETADA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
