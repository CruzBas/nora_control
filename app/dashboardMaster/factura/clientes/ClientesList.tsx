'use client';

import { useState } from 'react';
import { ClienteFacturacion } from '@/lib/types';
import { createClienteFacturacionAction, updateClienteFacturacionAction, deleteClienteFacturacionAction } from '@/lib/actions/clientes-facturacion.actions';
import ClienteFacturacionModal from './ClienteModal';

interface Props {
    initialClientes: ClienteFacturacion[];
}

export default function ClientesList({ initialClientes }: Props) {
    const [clientes, setClientes] = useState(initialClientes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState<ClienteFacturacion | null>(null);
    const [search, setSearch] = useState('');

    const handleSave = async (data: Partial<ClienteFacturacion>) => {
        if (selectedCliente) {
            const res = await updateClienteFacturacionAction(selectedCliente.id, data);
            if (res.success && res.data) {
                setClientes(clientes.map(c => c.id === selectedCliente.id ? res.data! : c));
            } else {
                throw new Error(res.error || 'Error al actualizar');
            }
        } else {
            const res = await createClienteFacturacionAction(data);
            if (res.success && res.data) {
                setClientes([...clientes, res.data]);
            } else {
                throw new Error(res.error || 'Error al crear');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Está seguro que desea eliminar este cliente?')) return;
        const res = await deleteClienteFacturacionAction(id);
        if (res.success) {
            setClientes(clientes.filter(c => c.id !== id));
        } else {
            alert(res.error || 'Error al eliminar');
        }
    };

    const filteredClientes = clientes.filter(c => 
        c.nombre.toLowerCase().includes(search.toLowerCase()) || 
        c.identificacion.includes(search)
    );

    const formatTipoId = (tipo: string) => {
        const types: Record<string, string> = {
            '01': 'Física',
            '02': 'Jurídica',
            '03': 'DIMEX',
            '04': 'NITE'
        };
        return types[tipo] || tipo;
    };

    return (
        <div className="bg-nora-blue-900 border border-nora-blue-800 rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-nora-gray-500">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o cédula..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl pl-10 pr-4 py-3 outline-none"
                    />
                </div>
                <button
                    onClick={() => {
                        setSelectedCliente(null);
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-nora-accent-500/20 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Cliente
                </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-nora-blue-800">
                            <th className="px-4 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Receptor</th>
                            <th className="px-4 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Identificación</th>
                            <th className="px-4 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Contacto</th>
                            <th className="px-4 py-4 text-[10px] font-black text-nora-gray-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nora-blue-800/50">
                        {filteredClientes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-nora-gray-500 text-sm font-bold">
                                    No se encontraron clientes.
                                </td>
                            </tr>
                        ) : (
                            filteredClientes.map(cliente => (
                                <tr key={cliente.id} className="hover:bg-nora-blue-800/30 transition-colors">
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-bold text-nora-white">{cliente.nombre}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-mono text-nora-gray-300">{cliente.identificacion}</p>
                                        <p className="text-[10px] text-nora-gray-500 uppercase">{formatTipoId(cliente.tipo_identificacion)}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        {cliente.email && <p className="text-xs text-nora-gray-400">{cliente.email}</p>}
                                        {cliente.telefono && <p className="text-xs text-nora-gray-400">{cliente.telefono}</p>}
                                        {!cliente.email && !cliente.telefono && <span className="text-xs text-nora-gray-600 italic">Sin contacto</span>}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCliente(cliente);
                                                    setIsModalOpen(true);
                                                }}
                                                className="w-8 h-8 rounded-lg bg-nora-blue-800/50 hover:bg-nora-blue-700 text-nora-gray-400 hover:text-nora-white transition-all flex items-center justify-center"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cliente.id)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-all flex items-center justify-center"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ClienteFacturacionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cliente={selectedCliente}
                onSave={handleSave}
            />
        </div>
    );
}
