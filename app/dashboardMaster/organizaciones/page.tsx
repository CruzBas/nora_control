'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUsuario } from '@/lib/hooks/useUsuario';
import {
    listarOrganizacionesAction,
    listarEmpresasAction,
    crearEmpresaAction,
    asignarEmpresaAction,
    actualizarEmpresaAction,
} from '@/lib/actions/organizacion.actions';
import { Organizacion, Empresa } from '@/lib/types';


function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,30,51,0.88)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-nora-blue-800 border border-nora-blue-700/60 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-nora-gray-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-nora-blue-700/50 hover:bg-nora-blue-600 flex items-center justify-center transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px] text-nora-gray-400">close</span>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}


export default function OrganizacionesPage() {
    const { usuario, loading: userLoading } = useUsuario();
    const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
    const [empresasSinOrg, setEmpresasSinOrg] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [toast, setToast] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);


    const [modalNuevaEmpresa, setModalNuevaEmpresa] = useState<Organizacion | null>(null);

    const [modalEditarEmpresa, setModalEditarEmpresa] = useState<Empresa | null>(null);

    const [formNombre, setFormNombre] = useState('');
    const [formPais, setFormPais] = useState('');
    const [formUbicacion, setFormUbicacion] = useState('');

    const esAdmin = usuario?.rol === 'Master' || usuario?.rol === 'Admin';

    const showToast = (msg: string, tipo: 'success' | 'error') => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [orgRes, empRes] = await Promise.all([
            listarOrganizacionesAction(),
            listarEmpresasAction(),
        ]);
        if (orgRes.success && orgRes.data) setOrganizaciones(orgRes.data as Organizacion[]);
        if (empRes.success && empRes.data) {
            const todas = empRes.data as Empresa[];
            setEmpresasSinOrg(todas.filter((e) => !e.organizacion_id));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userLoading) fetchData();
    }, [userLoading, fetchData]);


    const handleCrearEmpresa = async () => {
        if (!modalNuevaEmpresa || !formNombre.trim()) return;
        setProcesando(true);
        const res = await crearEmpresaAction(
            formNombre,
            modalNuevaEmpresa.id,
            formPais,
            formUbicacion
        );
        if (res.success) {
            showToast(`Sucursal "${formNombre}" creada correctamente`, 'success');
            setModalNuevaEmpresa(null);
            setFormNombre('');
            setFormPais('');
            setFormUbicacion('');
            await fetchData();
        } else {
            showToast(res.error || 'Error al crear la sucursal', 'error');
        }
        setProcesando(false);
    };


    const handleEditarEmpresa = async () => {
        if (!modalEditarEmpresa || !formNombre.trim()) return;
        setProcesando(true);
        const res = await actualizarEmpresaAction(modalEditarEmpresa.id, {
            nombre: formNombre,
            pais: formPais,
            ubicacion: formUbicacion,
        });
        if (res.success) {
            showToast(`Sucursal actualizada correctamente`, 'success');
            setModalEditarEmpresa(null);
            setFormNombre('');
            setFormPais('');
            setFormUbicacion('');
            await fetchData();
        } else {
            showToast(res.error || 'Error al actualizar la sucursal', 'error');
        }
        setProcesando(false);
    };


    const handleDesvincular = async (empresaId: string, nombre: string) => {
        if (!confirm(`¿Desvincular "${nombre}" de esta organización?`)) return;
        setProcesando(true);
        const res = await asignarEmpresaAction(empresaId, null);
        if (res.success) {
            showToast(`"${nombre}" desvinculada`, 'success');
            await fetchData();
        } else {
            showToast(res.error || 'Error al desvincular', 'error');
        }
        setProcesando(false);
    };


    const handleVincular = async (empresaId: string, orgId: string) => {
        setProcesando(true);
        const res = await asignarEmpresaAction(empresaId, orgId);
        if (res.success) {
            showToast('Empresa vinculada correctamente', 'success');
            await fetchData();
        } else {
            showToast(res.error || 'Error al vincular', 'error');
        }
        setProcesando(false);
    };


    if (userLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-nora-blue-900">
                <div className="w-10 h-10 border-2 border-nora-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!esAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                <div className="w-24 h-24 rounded-full bg-nora-danger/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-nora-danger">lock</span>
                </div>
                <h2 className="text-2xl font-black text-nora-gray-100 mb-2">Acceso Restringido</h2>
                <p className="text-nora-gray-400 text-sm max-w-sm">
                    Solo los usuarios con rol <strong className="text-nora-accent-400">Master</strong> o{' '}
                    <strong className="text-nora-accent-400">Admin</strong> pueden gestionar las organizaciones.
                </p>
            </div>
        );
    }


    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900">


            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border font-semibold text-sm animate-in slide-in-from-top-2 duration-300 ${toast.tipo === 'success'
                        ? 'bg-nora-success/15 border-nora-success/30 text-nora-success'
                        : 'bg-nora-danger/15 border-nora-danger/30 text-nora-danger'
                    }`}>
                    <span className="material-symbols-outlined text-[18px]">
                        {toast.tipo === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {toast.msg}
                </div>
            )}

            <div className="p-6 md:p-8 space-y-8">


                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-nora-accent-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-nora-accent-400 text-[22px]">corporate_fare</span>
                        </div>
                        <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight">
                            Organizaciones y Sucursales
                        </h1>
                    </div>
                    <p className="text-nora-gray-400 font-medium mt-1 ml-1">
                        Gestiona las empresas vinculadas a cada organización cliente.
                    </p>
                </div>


                {empresasSinOrg.length > 0 && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[18px] text-yellow-400">warning</span>
                            <p className="text-sm font-bold text-yellow-400">
                                {empresasSinOrg.length} empresa{empresasSinOrg.length !== 1 ? 's' : ''} sin organización asignada
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {empresasSinOrg.map((emp) => (
                                <div key={emp.id} className="flex items-center gap-1">
                                    <span className="px-3 py-1.5 bg-nora-blue-700/50 border border-nora-blue-600/40 rounded-xl text-xs text-nora-gray-300 font-medium">
                                        {emp.nombre}
                                    </span>
                                    {organizaciones.length > 0 && (
                                        <select
                                            defaultValue=""
                                            onChange={(e) => { if (e.target.value) handleVincular(emp.id, e.target.value); }}
                                            className="px-2 py-1.5 bg-nora-blue-800 border border-nora-blue-600/40 rounded-xl text-xs text-nora-gray-400 outline-none cursor-pointer appearance-none"
                                        >
                                            <option value="" disabled>→ Vincular a…</option>
                                            {organizaciones.map((org) => (
                                                <option key={org.id} value={org.id} style={{ background: '#162D4A' }}>
                                                    {org.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {organizaciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl text-center">
                        <span className="material-symbols-outlined text-5xl text-nora-gray-600 mb-4">corporate_fare</span>
                        <p className="text-nora-gray-400 font-bold text-xl">No hay organizaciones registradas</p>
                        <p className="text-nora-gray-500 text-sm mt-1">
                            Contacta a soporte para registrar la primera organización.
                        </p>
                    </div>
                ) : (

                    <div className="space-y-6">
                        {organizaciones.map((org) => {
                            const count = org.empresas?.length ?? 0;
                            return (
                                <div
                                    key={org.id}
                                    className="bg-nora-blue-800/40 border border-nora-blue-700/50 rounded-3xl overflow-hidden"
                                >

                                    <div className="flex items-center justify-between px-6 py-4 bg-nora-blue-800/60 border-b border-nora-blue-700/40">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-nora-accent-500/15 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-nora-accent-400 text-[18px]">corporate_fare</span>
                                            </div>
                                            <div>
                                                <h2 className="font-black text-nora-gray-100 text-lg leading-tight">{org.nombre}</h2>
                                                <p className="text-nora-gray-500 text-xs">
                                                    {count} sucursal{count !== 1 ? 'es' : ''} registrada{count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setFormNombre('');
                                                setFormPais('');
                                                setFormUbicacion('');
                                                setModalNuevaEmpresa(org);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-nora-accent-500/20 active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">add_business</span>
                                            Nueva Sucursal
                                        </button>
                                    </div>


                                    {count === 0 ? (
                                        <div className="px-6 py-8 text-center">
                                            <span className="material-symbols-outlined text-3xl text-nora-gray-700 mb-2 block">store</span>
                                            <p className="text-nora-gray-500 text-sm">Esta organización aún no tiene sucursales.</p>
                                            <button
                                                onClick={() => {
                                                    setFormNombre('');
                                                    setFormPais('');
                                                    setFormUbicacion('');
                                                    setModalNuevaEmpresa(org);
                                                }}
                                                className="mt-3 text-nora-accent-400 hover:text-nora-accent-300 text-sm font-bold transition-colors"
                                            >
                                                + Agregar la primera sucursal
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-nora-blue-700/30">
                                            {org.empresas!.map((emp, idx) => (
                                                <div
                                                    key={emp.id}
                                                    className="flex items-center gap-4 px-6 py-4 hover:bg-nora-blue-700/20 transition-all group"
                                                >

                                                    <div className="w-7 h-7 rounded-lg bg-nora-blue-700/60 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-black text-nora-gray-500">{idx + 1}</span>
                                                    </div>


                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-nora-gray-100 font-bold text-sm truncate">{emp.nombre}</p>
                                                        {(emp.pais || emp.ubicacion) && (
                                                            <p className="text-nora-gray-500 text-xs mt-0.5 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                                {[emp.pais, emp.ubicacion].filter(Boolean).join(' · ')}
                                                            </p>
                                                        )}
                                                    </div>


                                                    <div className="flex items-center gap-2">
                                                        {emp.pais && (
                                                            <span className="px-2 py-0.5 bg-nora-info/10 border border-nora-info/20 text-nora-info text-[11px] font-bold rounded-lg">
                                                                {emp.pais}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setFormNombre(emp.nombre);
                                                                setFormPais(emp.pais || '');
                                                                setFormUbicacion(emp.ubicacion || '');
                                                                setModalEditarEmpresa(emp);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl bg-nora-blue-700/50 hover:bg-nora-info/20 flex items-center justify-center transition-all"
                                                            title="Editar sucursal"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px] text-nora-info">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDesvincular(emp.id, emp.nombre)}
                                                            disabled={procesando}
                                                            className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-xl bg-nora-danger/10 hover:bg-nora-danger/20 border border-nora-danger/20 flex items-center justify-center transition-all"
                                                            title="Desvincular sucursal"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px] text-nora-danger">link_off</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>


            <Modal
                open={!!modalNuevaEmpresa}
                onClose={() => setModalNuevaEmpresa(null)}
                title={`Nueva Sucursal — ${modalNuevaEmpresa?.nombre ?? ''}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                            Nombre de la sucursal <span className="text-nora-danger">*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={formNombre}
                            onChange={(e) => setFormNombre(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCrearEmpresa()}
                            placeholder="Ej: Nora México"
                            className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                                País
                            </label>
                            <input
                                type="text"
                                value={formPais}
                                onChange={(e) => setFormPais(e.target.value)}
                                placeholder="Ej: México"
                                className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                                Ciudad / Ubicación
                            </label>
                            <input
                                type="text"
                                value={formUbicacion}
                                onChange={(e) => setFormUbicacion(e.target.value)}
                                placeholder="Ej: Ciudad de México"
                                className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-700"
                            />
                        </div>
                    </div>

                    <p className="text-nora-gray-600 text-xs">
                        La sucursal se creará vinculada automáticamente a{' '}
                        <span className="text-nora-accent-400 font-bold">{modalNuevaEmpresa?.nombre}</span>.
                    </p>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => setModalNuevaEmpresa(null)}
                            className="flex-1 py-3 bg-nora-blue-700/50 hover:bg-nora-blue-700 text-nora-gray-300 font-bold text-sm rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCrearEmpresa}
                            disabled={procesando || !formNombre.trim()}
                            className="flex-1 py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-bold text-sm rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">add_business</span>
                            {procesando ? 'Creando...' : 'Crear Sucursal'}
                        </button>
                    </div>
                </div>
            </Modal>


            <Modal
                open={!!modalEditarEmpresa}
                onClose={() => setModalEditarEmpresa(null)}
                title={`Editar Sucursal — ${modalEditarEmpresa?.nombre ?? ''}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                            Nombre de la sucursal <span className="text-nora-danger">*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            value={formNombre}
                            onChange={(e) => setFormNombre(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditarEmpresa()}
                            placeholder="Ej: Nora México"
                            className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-700"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                                País
                            </label>
                            <input
                                type="text"
                                value={formPais}
                                onChange={(e) => setFormPais(e.target.value)}
                                placeholder="Ej: México"
                                className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                                Ciudad / Ubicación
                            </label>
                            <input
                                type="text"
                                value={formUbicacion}
                                onChange={(e) => setFormUbicacion(e.target.value)}
                                placeholder="Ej: Ciudad de México"
                                className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={() => setModalEditarEmpresa(null)}
                            className="flex-1 py-3 bg-nora-blue-700/50 hover:bg-nora-blue-700 text-nora-gray-300 font-bold text-sm rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleEditarEmpresa}
                            disabled={procesando || !formNombre.trim()}
                            className="flex-1 py-3 bg-nora-info hover:bg-nora-info/80 text-white font-bold text-sm rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">save</span>
                            {procesando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
