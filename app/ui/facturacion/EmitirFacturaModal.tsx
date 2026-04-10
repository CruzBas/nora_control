'use client';

import { useState } from 'react';
import { Orden } from '@/lib/types';
import { ClienteFiscal, CONDICION_VENTA_LABELS, MEDIO_PAGO_LABELS, TipoDocumento, CondicionVenta, MedioPagoFE, TipoCedula } from '@/lib/types/facturacion';

interface Props {
    orden: Orden | null;
    clientes: ClienteFiscal[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function EmitirFacturaModal({ orden, clientes, onClose, onSuccess }: Props) {
    const [clienteId, setClienteId] = useState('');
    const [tipoDoc, setTipoDoc] = useState<TipoDocumento>('FE');
    const [condicionVenta, setCondicionVenta] = useState<CondicionVenta>('01');
    const [medioPago, setMedioPagoFE] = useState<MedioPagoFE>('01');
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<{ success: boolean; message: string; clave?: string } | null>(null);

    // Quick client fields
    const [useQuickClient, setUseQuickClient] = useState(false);
    const [qNombre, setQNombre] = useState('');
    const [qCedula, setQCedula] = useState('');
    const [qTipoCed, setQTipoCed] = useState<TipoCedula>('fisico');
    const [qEmail, setQEmail] = useState('');

    if (!orden) return null;

    const fmt = (val: number) => new Intl.NumberFormat('es-CR', {
        style: 'currency', currency: 'CRC', maximumFractionDigits: 0
    }).format(val);

    const handleEmitir = async () => {
        setLoading(true);
        setResultado(null);

        try {
            const res = await fetch('/api/facturacion/emitir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orden_id: orden.id,
                    tipo_documento: tipoDoc,
                    condicion_venta: condicionVenta,
                    medio_pago: medioPago,
                    cliente_fiscal_id: !useQuickClient ? clienteId || undefined : undefined,
                    receptor_nombre: useQuickClient ? qNombre : undefined,
                    receptor_cedula: useQuickClient ? qCedula : undefined,
                    receptor_tipo_cedula: useQuickClient ? qTipoCed : undefined,
                    receptor_email: useQuickClient ? qEmail : undefined,
                    notas,
                })
            });

            const result = await res.json();

            if (result.success) {
                setResultado({
                    success: true,
                    message: '¡Factura enviada exitosamente a Hacienda!',
                    clave: result.data?.clave_hacienda,
                });
                setTimeout(() => onSuccess(), 2000);
            } else {
                setResultado({
                    success: false,
                    message: result.error || 'Error al procesar la factura',
                });
            }
        } catch (err) {
            setResultado({
                success: false,
                message: (err as Error).message || 'Error inesperado',
            });
        }

        setLoading(false);
    };

    const inputCls = 'w-full px-3 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 rounded-xl text-nora-gray-200 text-sm focus:outline-none focus:border-nora-accent-500/50 transition-colors';
    const labelCls = 'block text-xs font-bold text-nora-gray-400 mb-1.5 uppercase tracking-wider';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-nora-blue-900 border border-nora-blue-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

                <div className="flex items-center justify-between p-6 border-b border-nora-blue-700/30">
                    <div>
                        <h2 className="text-xl font-black text-nora-gray-100">Emitir Factura Electrónica</h2>
                        <p className="text-sm text-nora-gray-500 mt-0.5">Orden: {orden.cliente_nombre} — {fmt(orden.total)}</p>
                    </div>
                    <button onClick={onClose} className="text-nora-gray-500 hover:text-white transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>


                <div className="p-6 space-y-5">

                    <div className="bg-nora-blue-800/40 border border-nora-blue-700/30 rounded-2xl p-4 space-y-2">
                        <h3 className="text-xs font-bold text-nora-gray-500 uppercase tracking-wider mb-2">Resumen de la Orden</h3>
                        {(orden.items || []).map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-nora-gray-300">{item.cantidad}x {item.nombre}</span>
                                <span className="text-nora-gray-400 font-medium">{fmt(item.precio * item.cantidad)}</span>
                            </div>
                        ))}
                        <div className="border-t border-nora-blue-700/30 pt-2 mt-2 flex justify-between">
                            <span className="text-sm font-bold text-nora-gray-300">Subtotal</span>
                            <span className="font-bold text-nora-gray-200">{fmt(orden.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-bold text-nora-gray-300">IVA (13%)</span>
                            <span className="font-bold text-nora-gray-200">{fmt(orden.impuesto)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-black text-nora-accent-400">Total</span>
                            <span className="font-black text-nora-accent-400 text-lg">{fmt(orden.total)}</span>
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Tipo Documento</label>
                            <select value={tipoDoc} onChange={e => setTipoDoc(e.target.value as TipoDocumento)} className={inputCls}>
                                <option value="FE">Factura Electrónica</option>
                                <option value="TE">Tiquete Electrónico</option>
                                <option value="NC">Nota de Crédito</option>
                                <option value="ND">Nota de Débito</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Condición Venta</label>
                            <select value={condicionVenta} onChange={e => setCondicionVenta(e.target.value as CondicionVenta)} className={inputCls}>
                                {Object.entries(CONDICION_VENTA_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Medio de Pago</label>
                        <select value={medioPago} onChange={e => setMedioPagoFE(e.target.value as MedioPagoFE)} className={inputCls}>
                            {Object.entries(MEDIO_PAGO_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>


                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <label className={`${labelCls} mb-0`}>Receptor</label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-nora-gray-400">
                                <input
                                    type="checkbox"
                                    checked={useQuickClient}
                                    onChange={e => setUseQuickClient(e.target.checked)}
                                    className="rounded border-nora-blue-700 bg-nora-blue-800 text-nora-accent-500 focus:ring-nora-accent-500"
                                />
                                Ingresar datos manualmente
                            </label>
                        </div>

                        {!useQuickClient ? (
                            <select value={clienteId} onChange={e => setClienteId(e.target.value)} className={inputCls}>
                                <option value="">-- Sin receptor (Tiquete) --</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} — {c.cedula}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="col-span-2">
                                    <label className={labelCls}>Nombre</label>
                                    <input value={qNombre} onChange={e => setQNombre(e.target.value)} className={inputCls} placeholder="Nombre del receptor" />
                                </div>
                                <div>
                                    <label className={labelCls}>Tipo Cédula</label>
                                    <select value={qTipoCed} onChange={e => setQTipoCed(e.target.value as TipoCedula)} className={inputCls}>
                                        <option value="fisico">Persona Física</option>
                                        <option value="juridico">Persona Jurídica</option>
                                        <option value="extranjero">Extranjero</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Cédula</label>
                                    <input value={qCedula} onChange={e => setQCedula(e.target.value)} className={inputCls} placeholder="Número de identificación" />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Email</label>
                                    <input type="email" value={qEmail} onChange={e => setQEmail(e.target.value)} className={inputCls} placeholder="correo@ejemplo.com" />
                                </div>
                            </div>
                        )}
                    </div>


                    <div>
                        <label className={labelCls}>Notas / Observaciones</label>
                        <textarea
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            className={`${inputCls} resize-none`}
                            rows={2}
                            placeholder="Opcional..."
                        />
                    </div>


                    {resultado && (
                        <div className={`p-4 rounded-2xl border ${resultado.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <span className="material-symbols-outlined text-lg">
                                    {resultado.success ? 'check_circle' : 'error'}
                                </span>
                                {resultado.message}
                            </div>
                            {resultado.clave && (
                                <p className="text-xs mt-2 font-mono text-nora-gray-400">Clave: {resultado.clave}</p>
                            )}
                        </div>
                    )}
                </div>


                <div className="flex items-center justify-end gap-3 p-6 border-t border-nora-blue-700/30">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 bg-nora-blue-800 border border-nora-blue-700 rounded-xl text-nora-gray-300 hover:text-white font-bold text-sm transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleEmitir}
                        disabled={loading || resultado?.success === true}
                        className="flex items-center gap-2 px-6 py-2.5 bg-nora-accent-500 hover:bg-nora-accent-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-nora-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">send</span>
                                Emitir Factura
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
