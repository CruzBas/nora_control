'use client';

import { useState } from 'react';
import { useFacturacion } from '@/lib/hooks/useFacturacion';
import { useClientesFiscales } from '@/lib/hooks/useClientesFiscales';
import FacturasList from '@/app/ui/facturacion/FacturasList';
import ClientesFiscalesList from '@/app/ui/facturacion/ClientesFiscalesList';
import ConfigFiscalForm from '@/app/ui/facturacion/ConfigFiscalForm';

type Tab = 'facturas' | 'clientes' | 'config';

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'facturas', label: 'Facturas', icon: 'description' },
    { id: 'clientes', label: 'Clientes', icon: 'people' },
    { id: 'config', label: 'Configuración', icon: 'settings' },
];

export default function FacturacionPage() {
    const [tab, setTab] = useState<Tab>('facturas');
    const { facturas, config, loading, fetchFacturas, saveConfig } = useFacturacion();
    const { clientes, loading: clientesLoading, createCliente, updateCliente, deleteCliente } = useClientesFiscales();

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900">
            <div className="p-6 md:p-8 space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-nora-accent-400">receipt_long</span>
                            Facturación Electrónica
                        </h1>
                        <p className="text-nora-gray-400 mt-1 font-medium">
                            Emisión y gestión de comprobantes electrónicos — Hacienda CR
                        </p>
                    </div>


                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold ${config?.modo === 'produccion'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                        <span className="material-symbols-outlined text-lg">
                            {config?.modo === 'produccion' ? 'verified' : 'science'}
                        </span>
                        {config?.modo === 'produccion' ? 'Producción' : 'Sandbox (Pruebas)'}
                    </div>
                </div>


                <div className="flex gap-1 p-1 bg-nora-blue-800/50 border border-nora-blue-700/30 rounded-2xl w-fit">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id
                                    ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/25'
                                    : 'text-nora-gray-400 hover:text-nora-gray-200 hover:bg-nora-blue-700/30'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{t.icon}</span>
                            <span className="hidden sm:inline">{t.label}</span>
                        </button>
                    ))}
                </div>


                {tab === 'facturas' && (
                    <FacturasList
                        facturas={facturas}
                        loading={loading}
                        onRefresh={fetchFacturas}
                    />
                )}

                {tab === 'clientes' && (
                    <ClientesFiscalesList
                        clientes={clientes}
                        loading={clientesLoading}
                        onCreate={createCliente}
                        onUpdate={updateCliente}
                        onDelete={deleteCliente}
                    />
                )}

                {tab === 'config' && (
                    <ConfigFiscalForm
                        config={config}
                        onSave={saveConfig}
                    />
                )}
            </div>
        </div>
    );
}
