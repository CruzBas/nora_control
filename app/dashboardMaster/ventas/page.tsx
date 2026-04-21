'use client';

import { useState, useMemo } from 'react';
import VentasHeader from '@/app/ui/ventas/VentasHeader';
import CategoryTabs from '@/app/ui/ventas/CategoryTabs';
import ProductCard from '@/app/ui/ventas/ProductCard';
import CartAside from '@/app/ui/ventas/CartAside';
import CheckoutModal from '@/app/ui/ventas/CheckoutModal';
import CierreCajaModal from '@/app/ui/ventas/CierreCajaModal';
import Toast from '@/app/ui/ventas/Toast';
import CustomizeProductModal from '@/app/ui/ventas/CustomizeProductModal';
import { usePOSProducts, useInventory } from '@/lib/hooks/hooks';
import { createOrdenAction } from '@/lib/actions/ordenes.actions';
import { Receta } from '@/lib/types';

interface CartItem extends Receta {
    quantity: number;
    notes?: string;
    extras?: { inventario_id: string; nombre: string, precio: number }[];
}

export default function VentasPage() {
    const { products, loading, error } = usePOSProducts();
    const { ingredients: insumos } = useInventory(); // Fetch ingredients for extras

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCierreOpen, setIsCierreOpen] = useState(false);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Receta | null>(null);

    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('¡Orden enviada a cocina!');
    const [activeCategory, setActiveCategory] = useState('all');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const categories = useMemo(() => [...new Set(products.map(p => p.categoria))].sort(), [products]);

    const filteredProducts = useMemo(
        () => activeCategory === 'all' ? products : products.filter(p => p.categoria === activeCategory),
        [products, activeCategory]
    );

    const handleProductClick = (product: Receta) => {
        setSelectedProduct(product);
        setIsCustomizeOpen(true);
    };

    const addToCart = (customData: { quantity: number; notes: string; extras: any[] }) => {
        if (!selectedProduct) return;

        setCart(prev => {
            // We check for items that are identical (same product, same notes, same extras)
            const sameExtras = (e1: any[], e2: any[]) => {
                if (e1.length !== e2.length) return false;
                return e1.every(extra => e2.some(e => e.inventario_id === extra.inventario_id));
            };

            const existingIndex = prev.findIndex(i => 
                i.id === selectedProduct.id && 
                i.notes === customData.notes && 
                sameExtras(i.extras || [], customData.extras)
            );

            if (existingIndex > -1) {
                const newCart = [...prev];
                newCart[existingIndex].quantity += customData.quantity;
                return newCart;
            }

            return [...prev, { ...selectedProduct, ...customData }];
        });
    };

    const removeFromCart = (id: string, notes?: string) => {
        // Find by id and notes to be safe, though id in cart is recipe_id
        setCart(prev => prev.filter(i => !(i.id === id && i.notes === notes)));
    };

    const updateQuantity = (id: string, delta: number, notes?: string) =>
        setCart(prev => prev.map(i => (i.id === id && i.notes === notes) ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((acc, i) => {
        const itemExtrasPrice = (i.extras || []).reduce((sum, e) => sum + e.precio, 0);
        return acc + (i.precio + itemExtrasPrice) * i.quantity;
    }, 0);
    const impuesto = subtotal * 0.13;
    const total = subtotal + impuesto;

    const handleConfirmOrder = async (clienteNombre: string, observaciones: string) => {
        setCheckoutLoading(true);
        try {
            const items = cart.map(i => ({
                receta_id: i.id,
                nombre: i.nombre,
                precio: i.precio + (i.extras || []).reduce((sum, e) => sum + e.precio, 0),
                cantidad: i.quantity,
                notas: i.notes,
                extras: i.extras
            }));

            const res = await createOrdenAction(clienteNombre, items, observaciones || undefined);
            if (res.success) {
                clearCart();
                setIsCheckoutOpen(false);
                setToastMsg(`✅ Orden de "${clienteNombre || 'Cliente'}" enviada a cocina`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
            } else {
                alert(`Error: ${res.error}`);
            }
        } catch (err) {
            alert('Error al crear la orden');
        } finally {
            setCheckoutLoading(false);
        }
    };


    const cartForAside = cart.map((i, index) => ({
        id: i.id, 
        name: i.nombre, 
        price: i.precio + (i.extras || []).reduce((sum, e) => sum + e.precio, 0), 
        category: i.categoria, 
        quantity: i.quantity,
        notes: i.notes,
        extras: i.extras,
        uniqueKey: `${i.id}-${index}` // to avoid duplicate keys in list
    }));

    return (
        <div className="flex flex-col lg:flex-row h-full max-h-screen lg:max-h-[calc(100vh-80px)] bg-nora-blue-900 lg:overflow-hidden text-nora-gray-100 border-nora-blue-800 shadow-2xl relative overflow-x-hidden">
            <main className="flex-1 flex flex-col min-h-0 min-w-0">
                <VentasHeader onCierreCaja={() => setIsCierreOpen(true)} />
                <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

                <div className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 custom-scrollbar scroll-smooth">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500" />
                            <p className="text-nora-gray-400 font-medium">Cargando menú...</p>
                        </div>
                    )}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                            <span className="material-symbols-outlined text-5xl text-nora-danger">error</span>
                            <p className="text-nora-gray-300 font-bold">{error}</p>
                        </div>
                    )}
                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border-2 border-dashed border-nora-blue-700 rounded-3xl p-8">
                            <span className="text-5xl">📋</span>
                            <p className="text-nora-gray-300 font-bold">
                                {activeCategory === 'all' ? 'No hay productos disponibles' : `No hay productos en "${activeCategory}"`}
                            </p>
                            <p className="text-nora-gray-500 text-sm max-w-xs">Ve a Inventario → Recetas para configurar productos.</p>
                        </div>
                    )}
                    {!loading && !error && filteredProducts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr pb-32 lg:pb-0">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={{ 
                                        id: product.id, 
                                        name: product.nombre, 
                                        price: product.precio, 
                                        category: product.categoria,
                                        stock_disponible: product.stock_disponible
                                    }}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <CartAside
                items={cartForAside}
                onRemove={(id) => {
                    const item = cartForAside.find(i => i.id === id);
                    removeFromCart(id, item?.notes);
                }}
                onUpdateQuantity={(id, delta) => {
                    const item = cartForAside.find(i => i.id === id);
                    updateQuantity(id, delta, item?.notes);
                }}
                onClear={clearCart}
                onCheckout={() => setIsCheckoutOpen(true)}
                subtotal={subtotal}
                total={total}
                showToast={false}
            />

            <CustomizeProductModal
                isOpen={isCustomizeOpen}
                onClose={() => setIsCustomizeOpen(false)}
                product={selectedProduct ? { id: selectedProduct.id, name: selectedProduct.nombre, price: selectedProduct.precio } : null}
                insumos={insumos.map(i => ({ ...i, id: i.id, producto: i.name })) as any}
                onConfirm={addToCart}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onFinish={handleConfirmOrder}
                total={total}
                loading={checkoutLoading}
            />

            <CierreCajaModal isOpen={isCierreOpen} onClose={() => setIsCierreOpen(false)} />

            <Toast show={showToast} message={toastMsg} />
        </div>
    );
}