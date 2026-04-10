'use client';

import { useState } from 'react';
import { ClienteFiscal, TipoCedula, TIPO_CEDULA_LABELS, PROVINCIAS_CR } from '@/lib/types/facturacion';

interface Props {
    clientes: ClienteFiscal[];
    loading: boolean;
    onCreate: (data: Partial<ClienteFiscal>) => Promise<unknown>;
    onUpdate: (id: string, data: Partial<ClienteFiscal>) => Promise<unknown>;
    onDelete: (id: string) => Promise<unknown>;
}

const emptyForm = {
    nombre: '', tipo_cedula: 'fisico' as TipoCedula, cedula: '', email: '',
    telefono: '', provincia: '', canton: '', distrito: '', otras_senas: '',
};

export default function ClientesFiscalesList({ clientes, loading, onCreate, onUpdate, onDelete }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ClienteFiscal | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
    const openEdit = (c: ClienteFiscal) => {
        setEditing(c);
        setForm({
            nombre: c.nombre, tipo_cedula: c.tipo_cedula, cedula: c.cedula,
            email: c.email, telefono: c.telefono, provincia: c.provincia,
            canton: c.canton, distrito: c.distrito, otras_senas: c.otras_senas,
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        if (editing) {
            await onUpdate(editing.id, form);
        } else {
            await onCreate(form);
        }
        setSaving(false);
        setModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        await onDelete(id);
        setDeleteConfirm(null);
    };

    const filtrados = clientes.filter(c => {
        if (!busqueda) return true;
        const q = busqueda.toLowerCase();
        return c.nombre.toLowerCase().includes(q) || c.cedula.includes(q) || c.email?.toLowerCase().includes(q);
    });

    const inputCls = 'w-full px-3 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 rounded-xl text-nora-gray-200 text-sm focus:outline-none focus:border-nora-accent-500/50 transition-colors';
    const labelCls = 'block text-xs font-bold text-nora-gray-400 mb-1.5 uppercase tracking-wider';

    return (
        <div className="space-y-4">

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-nora-gray-500 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 rounded-xl text-nora-gray-200 placeholder:text-nora-gray-600 text-sm focus:outline-none focus:border-nora-accent-500/50 transition-colors"
                    />
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 bg-nora-accent-500 hover:bg-nora-accent-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-nora-accent-500/25 active:scale-95"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Nuevo Cliente
                </button>
            </div>


            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-nora-accent-500/30 border-t-nora-accent-500 rounded-full animate-spin" />
                </div>
            ) : filtrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl text-center">
                    <span className="text-5xl mb-4">👤</span>
                    <p className="text-nora-gray-400 font-bold text-xl">No hay clientes fiscales</p>
                    <p className="text-nora-gray-500 text-sm mt-1">Agrega clientes para emitir facturas electrónicas.</p>
                </div>
            ) : (
                <div className="bg-nora-blue-800/30 border border-nora-blue-700/30 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-nora-blue-700/40">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Cédula</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider hidden lg:table-cell">Tipo</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-nora-blue-700/20">
                                {filtrados.map(c => (
                                    <tr key={c.id} className="hover:bg-nora-blue-800/40 transition-colors">
                                        <td className="px-4 py-3 font-bold text-nora-gray-200">{c.nombre}</td>
                                        <td className="px-4 py-3 text-nora-gray-400 font-mono text-xs">{c.cedula}</td>
                                        <td className="px-4 py-3 text-nora-gray-400 hidden md:table-cell">{c.email || '—'}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-xs bg-nora-blue-700/50 text-nora-gray-400 px-2 py-1 rounded-lg">{TIPO_CEDULA_LABELS[c.tipo_cedula]}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEdit(c)} className="p-1.5 text-nora-gray-500 hover:text-nora-accent-400 transition-colors" title="Editar">
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                {deleteConfirm === c.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
                                                            <span className="material-symbols-outlined text-lg">check</span>
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(null)} className="p-1.5 text-nora-gray-500 hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined text-lg">close</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-nora-gray-500 hover:text-red-400 transition-colors" title="Eliminar">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-nora-blue-900 border border-nora-blue-700/50 rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-nora-blue-700/30">
                            <h2 className="text-lg font-black text-nora-gray-100">
                                {editing ? 'Editar Cliente' : 'Nuevo Cliente Fiscal'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-nora-gray-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Nombre</label>
                                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className={inputCls} placeholder="Nombre completo" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Tipo Cédula</label>
                                    <select value={form.tipo_cedula} onChange={e => setForm(p => ({ ...p, tipo_cedula: e.target.value as TipoCedula }))} className={inputCls}>
                                        {Object.entries(TIPO_CEDULA_LABELS).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Cédula</label>
                                    <input value={form.cedula} onChange={e => setForm(p => ({ ...p, cedula: e.target.value }))} className={inputCls} placeholder="Número de identificación" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="correo@ejemplo.com" />
                                </div>
                                <div>
                                    <label className={labelCls}>Teléfono</label>
                                    <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} className={inputCls} placeholder="8888-8888" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={labelCls}>Provincia</label>
                                    <select value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))} className={inputCls}>
                                        <option value="">—</option>
                                        {Object.entries(PROVINCIAS_CR).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Cantón</label>
                                    <input value={form.canton} onChange={e => setForm(p => ({ ...p, canton: e.target.value }))} className={inputCls} placeholder="01" />
                                </div>
                                <div>
                                    <label className={labelCls}>Distrito</label>
                                    <input value={form.distrito} onChange={e => setForm(p => ({ ...p, distrito: e.target.value }))} className={inputCls} placeholder="01" />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Otras señas</label>
                                <input value={form.otras_senas} onChange={e => setForm(p => ({ ...p, otras_senas: e.target.value }))} className={inputCls} placeholder="Dirección exacta" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-nora-blue-700/30">
                            <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 bg-nora-blue-800 border border-nora-blue-700 rounded-xl text-nora-gray-300 font-bold text-sm transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.nombre}
                                className="flex items-center gap-2 px-6 py-2.5 bg-nora-accent-500 hover:bg-nora-accent-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-nora-accent-500/25 disabled:opacity-50 active:scale-95"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-lg">save</span>
                                )}
                                {editing ? 'Guardar Cambios' : 'Crear Cliente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
