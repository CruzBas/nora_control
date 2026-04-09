'use client';

import { useState } from 'react';
import { useProveedores } from '@/lib/hooks/useProveedores';
import ProveedorModal from './ProveedorModal';
import { Proveedor } from '@/lib/types';
import { useUsuario } from '@/lib/hooks/useUsuario';

export default function ProveedoresList() {
    const { usuario, loading: loadingUsuario } = useUsuario();
    const isAuthorized = usuario?.rol?.toLowerCase() === 'master' || usuario?.rol?.toLowerCase() === 'admin';
    const { proveedores, loading, error, deleteProveedor, refresh } = useProveedores();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

    if (loading || loadingUsuario) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-nora-danger/10 border border-nora-danger/20 rounded-3xl">
                <p className="text-nora-danger font-bold">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-nora-blue-900/60 p-6 rounded-3xl border border-nora-blue-700/50 backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-nora-gray-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-nora-accent-400 text-3xl">local_shipping</span>
                        Proveedores
                    </h2>
                    <p className="text-nora-gray-400 mt-1">Gestiona los contactos y proveedores de tu negocio.</p>
                </div>
                {isAuthorized && (
                    <button
                        onClick={() => { setEditingProveedor(null); setIsModalOpen(true); }}
                        className="bg-nora-accent-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nuevo Proveedor
                    </button>
                )}
            </div>

            <ProveedorModal
                isOpen={isModalOpen}
                proveedor={editingProveedor}
                onClose={() => { setIsModalOpen(false); setEditingProveedor(null); }}
                onSuccess={refresh}
            />

            <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest whitespace-nowrap">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest whitespace-nowrap">Contacto (WhatsApp)</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest whitespace-nowrap">Correo Electrónico</th>
                                <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nora-blue-700/30">
                            {proveedores.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-nora-gray-500 italic">
                                        No tienes proveedores registrados. ¡Agrega uno para empezar!
                                    </td>
                                </tr>
                            ) : (
                                proveedores.map((prov) => (
                                    <tr key={prov.id} className="hover:bg-nora-blue-700/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-base font-bold text-nora-gray-100 whitespace-nowrap">{prov.nombre}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {prov.contacto ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-nora-success">chat</span>
                                                    <span className="text-nora-gray-300 font-medium">{prov.contacto}</span>
                                                </div>
                                            ) : (
                                                <span className="text-nora-gray-500 italic text-sm">Sin contacto</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-nora-gray-400">{prov.email || <span className="italic text-nora-gray-500">Sin correo</span>}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isAuthorized && (
                                                    <button
                                                        onClick={() => { setEditingProveedor(prov); setIsModalOpen(true); }}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-accent-400 transition-colors bg-nora-blue-900/50 hover:bg-nora-blue-800 rounded-lg"
                                                        title="Editar proveedor"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                )}
                                                {isAuthorized && (
                                                    <button
                                                        onClick={() => deleteProveedor(prov.id)}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-danger transition-colors bg-nora-blue-900/50 hover:bg-nora-blue-800 rounded-lg"
                                                        title="Eliminar proveedor"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
