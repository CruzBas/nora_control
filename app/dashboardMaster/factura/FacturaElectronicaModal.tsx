'use client';

import { useState, useEffect } from 'react';
import { Orden, TipoDocumentoFE, ContribuyenteHacienda, FacturaElectronica, ConfigFacturacion, ClienteFacturacion } from '@/lib/types';
import {
    emitirDocumentoAction,
    consultarContribuyenteAction,
    getDocumentoByOrdenAction,
    getConfigFacturacionAction,
    consultarEstadoFEAction,
    getDocumentoFEAction,
} from '@/lib/actions/factura-electronica.actions';
import { getClientesFacturacionAction, createClienteFacturacionAction } from '@/lib/actions/clientes-facturacion.actions';
import FacturaVisual from '@/app/ui/factura/FacturaVisual';


interface Props {
    isOpen: boolean;
    onClose: () => void;
    orden: Orden | null;
    onSuccess?: (factura: FacturaElectronica) => void;
}

export default function FacturaElectronicaModal({ isOpen, onClose, orden, onSuccess }: Props) {
    const [tipoDoc, setTipoDoc] = useState<TipoDocumentoFE>('04'); // Default: Tiquete
    const [cedula, setCedula] = useState('');
    const [receptorNombre, setReceptorNombre] = useState('');
    const [receptorEmail, setReceptorEmail] = useState('');
    const [tipoId, setTipoId] = useState('01'); // Física
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [contribuyente, setContribuyente] = useState<ContribuyenteHacienda | null>(null);
    const [lookupError, setLookupError] = useState('');
    const [emitido, setEmitido] = useState<FacturaElectronica | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'form' | 'preview' | 'result'>('form');
    const [existingDoc, setExistingDoc] = useState<FacturaElectronica | null>(null);
    const [enrichedOrden, setEnrichedOrden] = useState<any>(null);
    const [config, setConfig] = useState<ConfigFacturacion | null>(null);
    const [clientesGuardados, setClientesGuardados] = useState<ClienteFacturacion[]>([]);
    const [guardarNuevoCliente, setGuardarNuevoCliente] = useState(false);

    useEffect(() => {
        if (isOpen && orden) {
            setStep('form');
            setTipoDoc('04');
            setCedula('');
            setReceptorNombre('');
            setReceptorEmail('');
            setContribuyente(null);
            setLookupError('');
            setEmitido(null);
            setError('');
            setExistingDoc(null);
            setEnrichedOrden(null);
            setGuardarNuevoCliente(false);

            // Fetch order with Cabys
            import('@/lib/actions/ordenes.actions').then(act => {
                act.getOrdenWithCabysAction(orden.id).then(res => {
                    if (res.success && res.data) {
                        setEnrichedOrden(res.data);
                    }
                });
            });

            // Check if order already has an electronic document
            getDocumentoByOrdenAction(orden.id).then(res => {
                if (res.success && res.data) {
                    setExistingDoc(res.data);
                }
            });

            // Fetch configuration
            getConfigFacturacionAction().then(res => {
                if (res.success && res.data) {
                    setConfig(res.data);
                }
            });

            // Fetch saved clients
            getClientesFacturacionAction().then(res => {
                if (res.success && res.data) {
                    setClientesGuardados(res.data);
                }
            });
        }
    }, [isOpen, orden]);

    // Automatic Polling
    useEffect(() => {
        let timer: NodeJS.Timeout;
        let attempts = 0;
        const maxAttempts = 12; // 1 minute (5s * 12)

        const poll = async () => {
            if (!emitido || (emitido.estado_hacienda !== 'enviado' && emitido.estado_hacienda !== 'pendiente')) {
                setIsPolling(false);
                return;
            }

            if (attempts >= maxAttempts) {
                setIsPolling(false);
                return;
            }

            attempts++;
            setIsPolling(true);
            const res = await consultarEstadoFEAction(emitido.id);

            if (res.success && res.data) {

                const { data: updatedDoc } = await getDocumentoFEAction(emitido.id);
                if (updatedDoc) {
                    setEmitido(updatedDoc);
                    if (updatedDoc.estado_hacienda === 'aceptado' || updatedDoc.estado_hacienda === 'rechazado') {
                        setIsPolling(false);
                        return;
                    }
                }
            }

            timer = setTimeout(poll, 5000);
        };

        if (emitido && (emitido.estado_hacienda === 'enviado' || emitido.estado_hacienda === 'pendiente') && !isPolling) {
            poll();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [emitido?.id, emitido?.estado_hacienda]);

    const handleLookup = async () => {
        if (!cedula || cedula.length < 9) {
            setLookupError('Ingrese una cédula válida (9-12 dígitos)');
            return;
        }
        setLookupLoading(true);
        setLookupError('');
        setContribuyente(null);

        // First check locally
        const saved = clientesGuardados.find(c => c.identificacion === cedula);
        if (saved) {
            setReceptorNombre(saved.nombre);
            setTipoId(saved.tipo_identificacion);
            setReceptorEmail(saved.email || '');
            setTipoDoc('01');
            setLookupLoading(false);
            return;
        }

        const res = await consultarContribuyenteAction(cedula);
        if (res.success && res.data) {
            setContribuyente(res.data);
            setReceptorNombre(res.data.nombre);
            setTipoDoc('01'); // Switch to Factura when we have receptor
        } else {
            setLookupError(res.error || 'No encontrado');
        }
        setLookupLoading(false);
    };

    const handleEmit = async () => {
        if (!orden) return;
        setLoading(true);
        setError('');

        // For Factura (01), receptor is required
        if (tipoDoc === '01' && !cedula) {
            setError('Para Factura Electrónica debe ingresar la cédula del receptor.');
            setLoading(false);
            return;
        }

        const items = (enrichedOrden?.items || (orden as any).items || []).map((item: any) => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio,
            codigo_cabys: item.codigo_cabys || item.receta?.codigo_cabys || '',
        }));

        if (items.length === 0) {
            setError('La orden no tiene productos para facturar.');
            setLoading(false);
            return;
        }

        // Validation for missing CABYS
        const missingCabys = items.filter((i: any) => !i.codigo_cabys);
        if (missingCabys.length > 0) {
            if (!window.confirm(`Hay ${missingCabys.length} productos sin código CABYS. Hacienda podría rechazar el documento. ¿Desea continuar de todos modos?`)) {
                setLoading(false);
                return;
            }
        }

        const res = await emitirDocumentoAction({
            orden_id: orden.id,
            tipo_documento: tipoDoc,
            receptor_nombre: tipoDoc === '01' ? receptorNombre : undefined,
            receptor_identificacion: tipoDoc === '01' ? cedula : undefined,
            receptor_tipo_identificacion: tipoDoc === '01' ? tipoId : undefined,
            receptor_email: tipoDoc === '01' ? receptorEmail || undefined : undefined,
            items,
            subtotal: Number(orden.subtotal),
            impuesto: Number(orden.impuesto),
            total: Number(orden.total),
        });

        if (res.success && res.data) {
            if (guardarNuevoCliente && tipoDoc === '01') {
                createClienteFacturacionAction({
                    nombre: receptorNombre,
                    identificacion: cedula,
                    tipo_identificacion: tipoId as any,
                    email: receptorEmail || undefined
                }).catch(err => console.error("Error guardando cliente:", err));
            }
            setEmitido(res.data);
            setStep('result');
            onSuccess?.(res.data);
        } else {
            setError(res.error || 'Error al emitir documento');
        }
        setLoading(false);
    };

    if (!isOpen || !orden) return null;

    const estadoColors: Record<string, string> = {
        pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        enviado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        aceptado: 'bg-green-500/10 text-green-400 border-green-500/30',
        rechazado: 'bg-red-500/10 text-red-400 border-red-500/30',
        error: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    const estadoIcons: Record<string, string> = {
        pendiente: 'schedule',
        enviado: 'cloud_upload',
        aceptado: 'check_circle',
        rechazado: 'cancel',
        error: 'error',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-nora-blue-900 border border-nora-blue-700/50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-nora-blue-900/95 backdrop-blur-md border-b border-nora-blue-700/50 px-8 py-6 rounded-t-3xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-nora-white uppercase tracking-tight">
                                Facturación Electrónica
                            </h2>
                            <p className="text-nora-gray-400 text-sm mt-1">
                                Orden #{orden.id.slice(0, 8)} — {orden.cliente_nombre}
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

                <div className="p-8 space-y-6">
                    {/* Already emitted warning */}
                    {existingDoc && step === 'form' && (
                        <div className={`p-4 rounded-2xl border ${estadoColors[existingDoc.estado_hacienda]}`}>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl">
                                    {estadoIcons[existingDoc.estado_hacienda]}
                                </span>
                                <div>
                                    <p className="font-bold text-sm">
                                        Esta orden ya tiene un documento electrónico
                                    </p>
                                    <p className="text-xs opacity-80 mt-0.5">
                                        Clave: {existingDoc.clave} — Estado: {existingDoc.estado_hacienda.toUpperCase()}
                                    </p>
                                    {existingDoc.mensaje_hacienda && (
                                        <p className="text-xs opacity-60 mt-1">{existingDoc.mensaje_hacienda}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'form' && (
                        <>
                            {/* Document Type Selection */}
                            <div>
                                <label className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest block mb-3">
                                    Tipo de Documento
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setTipoDoc('04'); setCedula(''); setContribuyente(null); }}
                                        className={`p-4 rounded-2xl border text-left transition-all ${tipoDoc === '04'
                                            ? 'bg-nora-accent-500/10 border-nora-accent-500 shadow-lg shadow-nora-accent-500/10'
                                            : 'bg-nora-blue-800/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`material-symbols-outlined text-2xl ${tipoDoc === '04' ? 'text-nora-accent-400' : 'text-nora-gray-500'}`}>
                                                receipt
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${tipoDoc === '04' ? 'text-nora-accent-400' : 'text-nora-gray-400'}`}>
                                                Tiquete (04)
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-nora-gray-500">
                                            Para consumidor final sin cédula registrada
                                        </p>
                                    </button>
                                    <button
                                        onClick={() => setTipoDoc('01')}
                                        className={`p-4 rounded-2xl border text-left transition-all ${tipoDoc === '01'
                                            ? 'bg-nora-accent-500/10 border-nora-accent-500 shadow-lg shadow-nora-accent-500/10'
                                            : 'bg-nora-blue-800/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`material-symbols-outlined text-2xl ${tipoDoc === '01' ? 'text-nora-accent-400' : 'text-nora-gray-500'}`}>
                                                description
                                            </span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${tipoDoc === '01' ? 'text-nora-accent-400' : 'text-nora-gray-400'}`}>
                                                Factura (01)
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-nora-gray-500">
                                            Para receptor con cédula — crédito fiscal
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {tipoDoc === '01' && (
                                <div className="space-y-4 bg-nora-blue-800/30 border border-nora-blue-700/40 rounded-2xl p-5">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest">
                                            Datos del Receptor
                                        </h3>
                                    </div>

                                    {clientesGuardados.length > 0 && (
                                        <div className="mb-2">
                                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Cliente Guardado</label>
                                            <select
                                                onChange={(e) => {
                                                    const cliente = clientesGuardados.find(c => c.id === e.target.value);
                                                    if (cliente) {
                                                        setCedula(cliente.identificacion);
                                                        setTipoId(cliente.tipo_identificacion);
                                                        setReceptorNombre(cliente.nombre);
                                                        setReceptorEmail(cliente.email || '');
                                                    } else {
                                                        setCedula('');
                                                        setTipoId('01');
                                                        setReceptorNombre('');
                                                        setReceptorEmail('');
                                                    }
                                                }}
                                                className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                                            >
                                                <option value="">Seleccione o digite abajo...</option>
                                                {clientesGuardados.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.nombre} ({c.identificacion})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Tipo ID</label>
                                            <select
                                                value={tipoId}
                                                onChange={(e) => setTipoId(e.target.value)}
                                                className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                                            >
                                                <option value="01">Física</option>
                                                <option value="02">Jurídica</option>
                                                <option value="03">DIMEX</option>
                                                <option value="04">NITE</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Cédula</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={cedula}
                                                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="Número de cédula"
                                                    maxLength={12}
                                                    className="flex-1 bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                                                />
                                                <button
                                                    onClick={handleLookup}
                                                    disabled={lookupLoading || cedula.length < 9}
                                                    className="px-4 bg-nora-accent-500/20 hover:bg-nora-accent-500 text-nora-accent-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                                    {lookupError && (
                                        <p className="text-nora-danger text-xs font-bold">{lookupError}</p>
                                    )}

                                    {contribuyente && (
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                                                <span className="text-xs font-black text-green-400 uppercase tracking-widest">Contribuyente encontrado</span>
                                            </div>
                                            <p className="text-sm font-bold text-nora-white">{contribuyente.nombre}</p>
                                            <p className="text-[10px] text-nora-gray-400 mt-0.5">
                                                {contribuyente.situacion?.estado} — {typeof contribuyente.regimen === 'object' ? contribuyente.regimen.descripcion : (contribuyente.regimen || 'Sin régimen')}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={receptorNombre}
                                            onChange={(e) => setReceptorNombre(e.target.value)}
                                            placeholder="Nombre o razón social"
                                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-nora-gray-500 block mb-1">Email (opcional)</label>
                                        <input
                                            type="email"
                                            value={receptorEmail}
                                            onChange={(e) => setReceptorEmail(e.target.value)}
                                            placeholder="correo@ejemplo.com"
                                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-bold rounded-xl p-3 outline-none"
                                        />
                                    </div>

                                    {cedula && receptorNombre && !clientesGuardados.some(c => c.identificacion === cedula) && (
                                        <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit p-2 rounded hover:bg-nora-blue-800/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={guardarNuevoCliente}
                                                onChange={(e) => setGuardarNuevoCliente(e.target.checked)}
                                                className="w-4 h-4 rounded text-nora-accent-500 bg-nora-blue-800 border-nora-blue-700 focus:ring-offset-nora-blue-900 focus:ring-nora-accent-500"
                                            />
                                            <span className="text-[10px] font-bold text-nora-gray-400 uppercase tracking-widest">Guardar en mis clientes</span>
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest border-b border-nora-blue-700/50 pb-2">
                                    Detalle del Documento
                                </h3>
                                {((orden as any).items || []).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-lg bg-nora-blue-800 flex items-center justify-center text-[10px] font-black text-nora-accent-400">
                                                {item.cantidad}x
                                            </span>
                                            <span className="text-sm font-bold text-nora-gray-200">{item.nombre}</span>
                                        </div>
                                        <span className="text-sm font-black text-nora-gray-300">
                                            ₡{(item.precio * item.cantidad).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t border-nora-blue-700/50 pt-3 space-y-1">
                                    <div className="flex justify-between text-xs text-nora-gray-400">
                                        <span>Subtotal</span>
                                        <span>₡{Number(orden.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-nora-gray-400">
                                        <span>IVA (13%)</span>
                                        <span>₡{Number(orden.impuesto).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-nora-white pt-1">
                                        <span>Total</span>
                                        <span>₡{Number(orden.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-400">error</span>
                                    <p className="text-xs font-bold text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Action */}
                            <button
                                onClick={handleEmit}
                                disabled={loading || !config || (tipoDoc === '01' && !cedula) || ((orden as any).items?.length === 0 && !enrichedOrden?.items)}
                                className="w-full py-5 font-black rounded-2xl shadow-xl uppercase tracking-widest text-base transition-all bg-gradient-to-r from-nora-accent-500 to-nora-accent-400 text-white shadow-nora-accent-500/20 hover:from-nora-accent-400 hover:to-nora-accent-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Enviando a Hacienda...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">send</span>
                                        Emitir {tipoDoc === '04' ? 'Tiquete' : 'Factura'} Electrónic{tipoDoc === '04' ? 'o' : 'a'}
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {/* Result Step */}
                    {step === 'result' && emitido && (
                        <div className="space-y-6">
                            <div className="text-center py-4">
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${emitido.estado_hacienda === 'error' || emitido.estado_hacienda === 'rechazado'
                                    ? 'bg-red-500/10'
                                    : emitido.estado_hacienda === 'aceptado'
                                        ? 'bg-green-500/10'
                                        : 'bg-blue-500/10'
                                    }`}>
                                    <span className={`material-symbols-outlined text-5xl ${emitido.estado_hacienda === 'error' || emitido.estado_hacienda === 'rechazado'
                                        ? 'text-red-400'
                                        : emitido.estado_hacienda === 'aceptado'
                                            ? 'text-green-400'
                                            : 'text-blue-400'
                                        }`}>
                                        {estadoIcons[emitido.estado_hacienda]}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-nora-white uppercase tracking-tight">
                                    {emitido.estado_hacienda === 'aceptado' ? 'Documento Aceptado' :
                                        emitido.estado_hacienda === 'enviado' ? 'Documento Enviado' :
                                            emitido.estado_hacienda === 'error' ? 'Error al Enviar' :
                                                emitido.estado_hacienda === 'rechazado' ? 'Documento Rechazado' :
                                                    'Procesando...'}
                                </h3>
                                {isPolling && (
                                    <div className="flex items-center justify-center gap-2 mt-2 text-nora-accent-400">
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest italic">Consultando estado final...</span>
                                    </div>
                                )}
                                <p className="text-nora-gray-400 text-sm mt-2">
                                    {emitido.mensaje_hacienda || 'El documento fue procesado.'}
                                </p>

                                {emitido.estado_hacienda === 'rechazado' && emitido.xml_respuesta && (
                                    <div className="mt-4 p-4 bg-red-900/30 border border-red-500/20 rounded-2xl text-left">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2">
                                            Razón del Rechazo:
                                        </p>
                                        <p className="text-red-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                                            {(() => {
                                                try {
                                                    const xml = atob(emitido.xml_respuesta);
                                                    const match = xml.match(/<DetalleMensaje>([\s\S]*?)<\/DetalleMensaje>/);
                                                    if (match && match[1]) {
                                                        let msj = match[1].replace(/&#13;/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                                        // Limpiar "El comprobante fue recibido en ambiente de pruebas"
                                                        msj = msj.replace(/Este comprobante fue recibido en el ambiente de pruebas[\s\S]*?El comprobante electrónico tiene los siguientes errores:\s*/i, '');
                                                        return msj.trim();
                                                    }
                                                } catch (e) { }
                                                return 'Por favor verifique la configuración o contacte a soporte.';
                                            })()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-nora-blue-800/40 border border-nora-blue-700/40 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Clave</span>
                                    <span className="text-xs font-mono text-nora-gray-300 break-all text-right max-w-[70%]">
                                        {emitido.clave}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Consecutivo</span>
                                    <span className="text-xs font-mono text-nora-gray-300">{emitido.numero_consecutivo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Tipo</span>
                                    <span className="text-xs font-bold text-nora-gray-300">
                                        {emitido.tipo_documento === '04' ? 'Tiquete Electrónico' : 'Factura Electrónica'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Total</span>
                                    <span className="text-sm font-black text-nora-accent-400">₡{Number(emitido.total).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">Estado</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${estadoColors[emitido.estado_hacienda]}`}>
                                        {emitido.estado_hacienda}
                                    </span>
                                </div>
                            </div>

                            {config && (
                                <div className="mt-4 border-2 border-nora-blue-700/50 rounded-3xl overflow-hidden scale-[0.9] origin-top">
                                    <FacturaVisual factura={emitido} config={config} />
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 py-4 font-black rounded-2xl uppercase tracking-widest text-sm transition-all bg-nora-accent-500 text-white hover:bg-nora-accent-400 shadow-lg shadow-nora-accent-500/10 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined uppercase">print</span>
                                    Imprimir
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 font-black rounded-2xl uppercase tracking-widest text-sm transition-all bg-nora-blue-800 text-nora-gray-300 hover:bg-nora-blue-700 border border-nora-blue-700/50"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
