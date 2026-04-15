'use client';

import { useState, useEffect } from 'react';
import { ClienteFacturacion } from '@/lib/types';
import { consultarContribuyenteAction } from '@/lib/actions/factura-electronica.actions';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cliente?: ClienteFacturacion | null;
    onSave: (data: Partial<ClienteFacturacion>) => Promise<void>;
}

export default function ClienteFacturacionModal({ isOpen, onClose, cliente, onSave }: Props) {
    const [nombre, setNombre] = useState('');
    const [identificacion, setIdentificacion] = useState('');
    const [tipoIdentificacion, setTipoIdentificacion] = useState('01');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');
    const [contribuyente, setContribuyente] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (cliente) {
                setNombre(cliente.nombre);
                setIdentificacion(cliente.identificacion);
                setTipoIdentificacion(cliente.tipo_identificacion);
                setEmail(cliente.email || '');
                setTelefono(cliente.telefono || '');
            } else {
                setNombre('');
                setIdentificacion('');
                setTipoIdentificacion('01');
                setEmail('');
                setTelefono('');
            }
            setError('');
            setLookupError('');
            setContribuyente(null);
        }
    }, [isOpen, cliente]);

    const handleLookup = async () => {
        if (!identificacion || identificacion.length < 9) {
            setLookupError('Ingrese una cédula válida (9-12 dígitos)');
            return;
        }
        setLookupLoading(true);
        setLookupError('');

        const res = await consultarContribuyenteAction(identificacion);
        if (res.success && res.data) {
            setContribuyente(res.data);
            setNombre(res.data.nombre);
            // Automatically set type based on length if possible
            if (identificacion.length === 9) setTipoIdentificacion('01');
            else if (identificacion.length === 10) setTipoIdentificacion('02');
            else if (identificacion.length === 11 || identificacion.length === 12) setTipoIdentificacion('03');
        } else {
            setLookupError(res.error || 'No encontrado en Hacienda');
        }
        setLookupLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !identificacion || !tipoIdentificacion) {
            setError('Nombre, Cédula y Tipo son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSave({
                nombre,
                identificacion,
                tipo_identificacion: tipoIdentificacion as any,
                email,
                telefono,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el cliente');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-nora-blue-900 border border-nora-blue-700/50 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-nora-blue-900/95 backdrop-blur-md border-b border-nora-blue-700/50 px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-nora-white uppercase tracking-tight">
                                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <p className="text-nora-gray-400 text-sm mt-1">
                                {cliente ? 'Actualizar datos del receptor' : 'Registrar receptor para facturación'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-nora-gray-500 hover:text-nora-white transition-colors rounded-xl hover:bg-nora-blue-800"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1 uppercase">Tipo ID</label>
                            <select
                                value={tipoIdentificacion}
                                onChange={(e) => setTipoIdentificacion(e.target.value)}
                                className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                            >
                                <option value="01">Física (01)</option>
                                <option value="02">Jurídica (02)</option>
                                <option value="03">DIMEX (03)</option>
                                <option value="04">NITE (04)</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1 uppercase">Identificación</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={identificacion}
                                    onChange={(e) => setIdentificacion(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Número de cédula"
                                    maxLength={12}
                                    className="flex-1 bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleLookup}
                                    disabled={lookupLoading || identificacion.length < 9}
                                    className="px-4 bg-nora-accent-500/20 hover:bg-nora-accent-500 text-nora-accent-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    title="Buscar en Hacienda"
                                >
                                    {lookupLoading ? (
                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">search</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    {lookupError && <p className="text-nora-danger text-xs font-bold">{lookupError}</p>}

                    {contribuyente && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                                <span className="text-xs font-black text-green-400 uppercase tracking-widest">Encontrado</span>
                            </div>
                            <p className="text-sm font-bold text-nora-white">{contribuyente.nombre}</p>
                            <p className="text-[10px] text-nora-gray-400 mt-0.5">
                                {contribuyente.situacion?.estado} — {typeof contribuyente.regimen === 'object' ? contribuyente.regimen.descripcion : (contribuyente.regimen || 'Sin régimen')}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1 uppercase">Nombre / Razón Social</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre completo..."
                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1 uppercase">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1 uppercase">Teléfono</label>
                            <input
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="88888888"
                                className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-400">error</span>
                            <p className="text-xs font-bold text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 font-black rounded-xl uppercase tracking-widest text-sm transition-all bg-nora-blue-800 text-nora-gray-300 hover:bg-nora-blue-700 border border-nora-blue-700/50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 font-black rounded-xl uppercase tracking-widest text-sm transition-all bg-nora-accent-500 text-white hover:bg-nora-accent-400 shadow-lg shadow-nora-accent-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-lg">save</span>
                            )}
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
