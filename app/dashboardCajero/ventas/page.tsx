'use client';

import { useState, useMemo } from 'react';
import VentasHeader from '@/app/ui/ventas/VentasHeader';
import CategoryTabs from '@/app/ui/ventas/CategoryTabs';
import ProductCard from '@/app/ui/ventas/ProductCard';
import CartAside from '@/app/ui/ventas/CartAside';
import CheckoutModal from '@/app/ui/ventas/CheckoutModal';
import { usePOSProducts } from '@/app/lib/hooks';
import { Receta } from '@/lib/types';

interface CartItem extends Receta {
    quantity: number;
}

export default function VentasPage() {
    const { products, loading, error } = usePOSProducts();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    // Derivar categorías únicas de los productos reales
    const categories = useMemo(() => {
        const unique = [...new Set(products.map(p => p.categoria))].sort();
        return unique;
    }, [products]);

    // Filtrar por categoría activa
    const filteredProducts = useMemo(() => {
        if (activeCategory === 'all') return products;
        return products.filter(p => p.categoria === activeCategory);
    }, [products, activeCategory]);

    const addToCart = (product: Receta) => {
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

    const subtotal = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    const total = subtotal * 1.13;

    const handleFinish = () => {
        setIsModalOpen(false);
        setCart([]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Adaptar CartItem al formato que espera CartAside
    const cartForAside = cart.map(item => ({
        id: item.id,
        name: item.nombre,
        price: item.precio,
        category: item.categoria,
        quantity: item.quantity,
        receta_id: item.id,
    }));

    return (
        <div className="flex flex-col lg:flex-row h-full max-h-screen lg:max-h-[calc(100vh-80px)] bg-nora-blue-900 lg:overflow-hidden text-nora-gray-100 border-nora-blue-800 shadow-2xl relative overflow-x-hidden">

            <main className="flex-1 flex flex-col min-h-0 min-w-0">
                <VentasHeader />
                <CategoryTabs
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 custom-scrollbar scroll-smooth">

                    {/* Estado de carga */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500" />
                            <p className="text-nora-gray-400 font-medium">Cargando menú...</p>
                        </div>
                    )}

                    {/* Estado de error */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <span className="material-symbols-outlined text-5xl text-nora-danger">error</span>
                            <p className="text-nora-gray-300 font-bold">Error al cargar el menú</p>
                            <p className="text-nora-gray-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Sin productos configurados */}
                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed border-nora-blue-700 rounded-3xl p-8">
                            <span className="text-5xl">📋</span>
                            <p className="text-nora-gray-300 font-bold text-lg">
                                {activeCategory === 'all'
                                    ? 'No hay productos disponibles'
                                    : `No hay productos en "${activeCategory}"`}
                            </p>
                            <p className="text-nora-gray-500 text-sm max-w-xs">
                                Ve a <strong>Inventario → Recetas</strong> y vincula ingredientes a los productos para que aparezcan aquí.
                            </p>
                        </div>
                    )}

                    {/* Grid de productos */}
                    {!loading && !error && filteredProducts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr pb-32 lg:pb-0">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={{
                                        id: product.id,
                                        name: product.nombre,
                                        price: product.precio,
                                        category: product.categoria,
                                    }}
                                    onClick={() => addToCart(product)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CartAside
                items={cartForAside}
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