'use client';

import ProveedoresList from '@/app/ui/proveedores/ProveedoresList';

export default function ProveedoresPage() {
    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900 text-nora-gray-100">
            <header className="bg-nora-blue-900/95 sticky top-0 z-40 backdrop-blur-xl border-b border-nora-blue-700/50 shadow-sm">
                <div className="flex items-center gap-4 px-6 md:px-8 h-20">
                    <div className="h-10 w-10 bg-nora-accent-500/20 flex items-center justify-center rounded-2xl border border-nora-accent-500/30">
                        <span className="material-symbols-outlined text-nora-accent-400">local_shipping</span>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-nora-gray-100 tracking-tight">Proveedores</h1>
                        <p className="text-xs md:text-sm text-nora-gray-400 font-medium">Gestión de contactos para reabastecimiento</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8">
                <ProveedoresList />
            </main>
        </div>
    );
}
