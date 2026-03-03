'use client';

import { useState } from 'react';
import VentasHeader from '@/app/ui/ventas/VentasHeader';
import CategoryTabs from '@/app/ui/ventas/CategoryTabs';
import ProductCard from '@/app/ui/ventas/ProductCard';
import CartAside from '@/app/ui/ventas/CartAside';
import CheckoutModal from '@/app/ui/ventas/CheckoutModal';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
}

interface CartItem extends Product {
    quantity: number;
}

const products: Product[] = [
    { id: '1', name: 'Café Americano 12oz', price: 1500, category: 'drinks' },
    { id: '2', name: 'Hamburguesa NÖRA Especial con Queso', price: 5500, category: 'food' },
    { id: '3', name: 'Pastel de Chocolate Premium', price: 2200, category: 'desserts' },
    { id: '4', name: 'Pizza Personal Artesanal', price: 4800, category: 'food' },
    { id: '5', name: 'Refresco Botella 600ml', price: 1200, category: 'drinks' },
    { id: '6', name: 'Cheesecake Frutos Rojos', price: 2500, category: 'desserts' },
    { id: '7', name: 'Papas Supremas con Bacon', price: 3200, category: 'food' },
    { id: '8', name: 'Batido Natural de Fresa', price: 1800, category: 'drinks' },
];

export default function VentasPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal * 1.13;

    const handleFinish = () => {
        setIsModalOpen(false);
        setCart([]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full max-h-screen lg:max-h-[calc(100vh-80px)] bg-nora-blue-900 lg:overflow-hidden text-nora-gray-100 lg:rounded-[2.5rem] border border-nora-blue-800 shadow-2xl relative overflow-x-hidden">

            <main className="flex-1 flex flex-col min-h-0 min-w-0">
                <VentasHeader />
                <CategoryTabs />

                <div className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 custom-scrollbar scroll-smooth">

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr pb-32 lg:pb-0">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => addToCart(product)}
                            />
                        ))}
                    </div>
                </div>
            </main>


            <CartAside
                items={cart}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onClear={clearCart}
                onCheckout={() => setIsModalOpen(true)}
                subtotal={subtotal}
                total={total}
                showToast={showToast}
            />

            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFinish={handleFinish}
                total={total}
            />
        </div>
    );
}