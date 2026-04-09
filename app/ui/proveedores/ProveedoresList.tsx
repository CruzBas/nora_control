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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-nora-blue-900/60 p-5 sm:p-6 rounded-3xl border border-nora-blue-700/50 backdrop-blur-md gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-nora-accent-500/10 flex items-center justify-center border border-nora-accent-500/20">
                        <span className="material-symbols-outlined text-nora-accent-400 text-2xl sm:text-3xl">local_shipping</span>
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-nora-gray-100 uppercase tracking-tight">Proveedores</h2>
                        <p className="text-nora-gray-400 text-xs sm:text-sm">Contactos y suministro.</p>
                    </div>
                </div>
                {isAuthorized && (
                    <button
                        onClick={() => { setEditingProveedor(null); setIsModalOpen(true); }}
                        className="w-full sm:w-auto bg-nora-accent-500 text-white px-6 py-4 sm:py-3 rounded-2xl font-black shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
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
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest whitespace-nowrap">Nombre</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest whitespace-nowrap">WhatsApp</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest whitespace-nowrap">Email</th>
                                <th className="px-5 sm:px-6 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-right whitespace-nowrap">⚙️</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nora-blue-700/30">
                            {proveedores.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-nora-gray-500 italic text-sm">
                                        No tienes proveedores registrados.
                                    </td>
                                </tr>
                            ) : (
                                proveedores.map((prov) => (
                                    <tr key={prov.id} className="hover:bg-nora-blue-700/10 transition-colors group">
                                        <td className="px-5 sm:px-6 py-4">
                                            <span className="text-xs sm:text-sm font-bold text-nora-gray-100 whitespace-nowrap">{prov.nombre}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4">
                                            {prov.contacto ? (
                                                <div className="flex items-center gap-2 bg-nora-success/10 border border-nora-success/20 px-3 py-1 rounded-xl w-fit">
                                                    <span className="material-symbols-outlined text-[14px] text-nora-success">chat</span>
                                                    <span className="text-nora-gray-100 font-bold text-xs">{prov.contacto}</span>
                                                </div>
                                            ) : (
                                                <span className="text-nora-gray-500 italic text-[10px] uppercase">Sin contacto</span>
                                            )}
                                        </td>
                                        <td className="px-5 sm:px-6 py-4">
                                            <span className="text-xs text-nora-gray-400 whitespace-nowrap">{prov.email || <span className="italic opacity-50">Sin correo</span>}</span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                {isAuthorized && (
                                                    <button
                                                        onClick={() => { setEditingProveedor(prov); setIsModalOpen(true); }}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-accent-500 hover:bg-nora-accent-500/10 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                )}
                                                {isAuthorized && (
                                                    <button
                                                        onClick={() => deleteProveedor(prov.id)}
                                                        className="p-2 text-nora-gray-400 hover:text-nora-danger hover:bg-nora-danger/10 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
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
