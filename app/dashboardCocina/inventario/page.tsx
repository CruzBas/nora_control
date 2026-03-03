'use client';

import { useState } from 'react';
import InventoryHeader from '@/app/ui/inventario/InventoryHeader';
import IngredientsSection from '@/app/ui/inventario/IngredientsSection';


export default function InventarioPage() {
    const [activeTab, setActiveTab] = useState('insumos');

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 text-nora-gray-100">
            <InventoryHeader
                title="Gestión de Inventario"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showMenu={false}
                showRecetas={false}

            />

            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
                {activeTab === 'insumos' && <IngredientsSection showAgregar={false} />}


            </main>
        </div>
    );
}