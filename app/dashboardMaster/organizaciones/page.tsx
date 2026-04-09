'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUsuario } from '@/lib/hooks/useUsuario';
import Modal from '@/app/ui/common/Modal';
import {
    listarOrganizacionesAction,
    listarEmpresasAction,
    crearEmpresaAction,
    asignarEmpresaAction,
    actualizarEmpresaAction,
} from '@/lib/actions/organizacion.actions';
import { Organizacion, Empresa } from '@/lib/types';


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
        <div className="flex flex-col min-h-screen bg-nora-blue-900 pb-20">


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


                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-nora-accent-500/10 flex items-center justify-center border border-nora-accent-500/20">
                        <span className="material-symbols-outlined text-nora-accent-400 text-3xl sm:text-4xl">corporate_fare</span>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-nora-gray-100 tracking-tight uppercase">
                            Organizaciones
                        </h1>
                        <p className="text-nora-gray-400 text-xs sm:text-sm font-medium tracking-wide">
                            Gestión de sucursales y vinculación de empresas.
                        </p>
                    </div>
                </div>


                {empresasSinOrg.length > 0 && (
                    <div className="bg-nora-accent-500/5 border border-nora-accent-500/20 rounded-3xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[20px] text-nora-accent-400">notification_important</span>
                            <p className="text-sm font-black text-nora-accent-400 uppercase tracking-widest">
                                {empresasSinOrg.length} empresa{empresasSinOrg.length !== 1 ? 's' : ''} pendiente{empresasSinOrg.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {empresasSinOrg.map((emp) => (
                                <div key={emp.id} className="flex items-center gap-0.5 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl overflow-hidden pl-3 pr-1 py-1">
                                    <span className="text-[10px] sm:text-xs text-nora-gray-200 font-bold whitespace-nowrap mr-2">
                                        {emp.nombre}
                                    </span>
                                    {organizaciones.length > 0 && (
                                        <select
                                            defaultValue=""
                                            onChange={(e) => { if (e.target.value) handleVincular(emp.id, e.target.value); }}
                                            className="px-2 py-1.5 bg-nora-accent-500/10 border border-nora-accent-500/30 rounded-xl text-[10px] text-nora-accent-400 font-black outline-none cursor-pointer hover:bg-nora-accent-500/20 transition-all appearance-none"
                                        >
                                            <option value="" disabled>→ VINCULAR</option>
                                            {organizaciones.map((org) => (
                                                <option key={org.id} value={org.id} style={{ background: '#162D4A', color: 'white' }}>
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
                    <div className="flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border border-nora-blue-700/50 rounded-3xl text-center">
                        <span className="material-symbols-outlined text-5xl text-nora-gray-600 mb-4 opacity-20">corporate_fare</span>
                        <p className="text-nora-gray-400 font-black text-xs uppercase tracking-widest">No hay organizaciones registradas</p>
                    </div>
                ) : (

                    <div className="space-y-8">
                        {organizaciones.map((org) => {
                            const count = org.empresas?.length ?? 0;
                            return (
                                <div
                                    key={org.id}
                                    className="bg-nora-blue-800/40 border border-nora-blue-700/30 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
                                >

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 bg-nora-blue-900/40 border-b border-nora-blue-700/40 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-nora-accent-500/15 flex items-center justify-center border border-nora-accent-500/20">
                                                <span className="material-symbols-outlined text-nora-accent-400 text-2xl">business_center</span>
                                            </div>
                                            <div>
                                                <h2 className="font-black text-nora-gray-100 text-xl sm:text-2xl tracking-tight uppercase leading-none">{org.nombre}</h2>
                                                <p className="text-nora-gray-500 text-[10px] font-black uppercase tracking-widest mt-2 bg-nora-blue-900/60 px-2 py-0.5 rounded-lg w-fit">
                                                    {count} sucursal{count !== 1 ? 'es' : ''}
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
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 sm:py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-black text-[10px] rounded-2xl transition-all shadow-lg shadow-nora-accent-500/20 active:scale-95 uppercase tracking-widest"
                                        >
                                            <span className="material-symbols-outlined text-base">add_business</span>
                                            Nueva Sucursal
                                        </button>
                                    </div>


                                    {count === 0 ? (
                                        <div className="px-6 py-16 text-center">
                                            <span className="material-symbols-outlined text-4xl text-nora-gray-700 mb-3 block opacity-20">store</span>
                                            <p className="text-nora-gray-500 text-xs font-black uppercase tracking-widest">Sin sucursales registradas</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-nora-blue-700/20">
                                            {org.empresas!.map((emp, idx) => (
                                                <div
                                                    key={emp.id}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 sm:px-8 py-5 sm:py-4 hover:bg-nora-blue-700/10 transition-all group"
                                                >

                                                    <div className="hidden sm:flex w-8 h-8 rounded-xl bg-nora-blue-700/30 items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-black text-nora-gray-500">{idx + 1}</span>
                                                    </div>


                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-nora-gray-100 font-black text-sm uppercase tracking-tight truncate">{emp.nombre}</p>
                                                            {emp.pais && (
                                                                <span className="px-2 py-0.5 bg-nora-info/10 text-nora-info text-[9px] font-black rounded-lg uppercase tracking-tighter sm:tracking-normal">
                                                                    {emp.pais}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {emp.ubicacion && (
                                                            <p className="text-nora-gray-500 text-[10px] mt-1 flex items-center gap-1 font-bold">
                                                                <span className="material-symbols-outlined text-[12px] opacity-40">location_on</span>
                                                                {emp.ubicacion}
                                                            </p>
                                                        )}
                                                    </div>


                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start border-t border-nora-blue-700/30 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                                        <button
                                                            onClick={() => {
                                                                setFormNombre(emp.nombre);
                                                                setFormPais(emp.pais || '');
                                                                setFormUbicacion(emp.ubicacion || '');
                                                                setModalEditarEmpresa(emp);
                                                            }}
                                                            className="flex-1 sm:flex-none px-4 sm:px-0 sm:w-10 sm:h-10 py-2 sm:py-0 rounded-xl bg-nora-blue-900/60 sm:bg-nora-blue-700/40 hover:bg-nora-info/20 flex items-center justify-center transition-all border border-nora-blue-700/50 sm:border-0"
                                                            title="Editar sucursal"
                                                        >
                                                            <span className="material-symbols-outlined text-base text-nora-info">edit</span>
                                                            <span className="sm:hidden text-[10px] font-black uppercase ml-2 text-nora-info">Editar</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDesvincular(emp.id, emp.nombre)}
                                                            disabled={procesando}
                                                            className="flex-1 sm:flex-none px-4 sm:px-0 sm:w-10 sm:h-10 py-2 sm:py-0 rounded-xl bg-nora-danger/10 hover:bg-nora-danger/20 border border-nora-danger/20 flex items-center justify-center transition-all"
                                                            title="Desvincular sucursal"
                                                        >
                                                            <span className="material-symbols-outlined text-base text-nora-danger">link_off</span>
                                                            <span className="sm:hidden text-[10px] font-black uppercase ml-2 text-nora-danger">Desvincular</span>
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
                isOpen={!!modalNuevaEmpresa}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <p className="text-nora-gray-600 text-[10px] font-medium leading-relaxed">
                        La sucursal se creará vinculada automáticamente a{' '}
                        <span className="text-nora-accent-400 font-bold">{modalNuevaEmpresa?.nombre}</span>.
                    </p>

                    <div className="flex gap-3 pt-4 sm:pt-2 border-t border-nora-blue-700/30">
                        <button
                            onClick={() => setModalNuevaEmpresa(null)}
                            className="flex-1 py-3 bg-nora-blue-700/30 hover:bg-nora-blue-700/50 text-nora-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCrearEmpresa}
                            disabled={procesando || !formNombre.trim()}
                            className="flex-1 py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {procesando ? 'Creando...' : 'Crear Sucursal'}
                        </button>
                    </div>
                </div>
            </Modal>


            <Modal
                isOpen={!!modalEditarEmpresa}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="flex gap-3 pt-4 sm:pt-2 border-t border-nora-blue-700/30">
                        <button
                            onClick={() => setModalEditarEmpresa(null)}
                            className="flex-1 py-3 bg-nora-blue-700/30 hover:bg-nora-blue-700/50 text-nora-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleEditarEmpresa}
                            disabled={procesando || !formNombre.trim()}
                            className="flex-1 py-3 bg-nora-info hover:bg-nora-info/80 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {procesando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
