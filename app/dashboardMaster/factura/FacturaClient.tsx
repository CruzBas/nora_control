'use client';

import { useState, useEffect } from 'react';
import { Orden, MetodoPago, FacturaElectronica, ConfigFacturacion } from '@/lib/types';
import { pagarOrdenAction } from '@/lib/actions/ordenes.actions';
import { getDocumentosByOrdenesAction, getConfigFacturacionAction } from '@/lib/actions/factura-electronica.actions';
import { getTipoCambioAction } from '@/lib/actions/tipoCambio.actions';
import FacturaElectronicaModal from './FacturaElectronicaModal';

interface FacturaClientProps {
    initialOrdenes: Orden[];
    initialCerradas: Orden[];
}

export default function FacturaClient({ initialOrdenes, initialCerradas }: FacturaClientProps) {
    const [ordenes, setOrdenes] = useState<Orden[]>(initialOrdenes);
    const [cerradas, setCerradas] = useState<Orden[]>(initialCerradas);
    const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
    const [activeTab, setActiveTab] = useState<'pendientes' | 'cerradas'>('pendientes');
    const [loading, setLoading] = useState(false);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
    const [showFEModal, setShowFEModal] = useState(false);
    const [ordenParaFE, setOrdenParaFE] = useState<Orden | null>(null);
    const [docEmitidos, setDocEmitidos] = useState<Record<string, FacturaElectronica>>({});
    const [configFE, setConfigFE] = useState<ConfigFacturacion | null>(null);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [isSplitMode, setIsSplitMode] = useState(false);
    const [pagosList, setPagosList] = useState<{ id: string, metodo: MetodoPago, monto: number }[]>([]);
    const [incluirIVA, setIncluirIVA] = useState(true);

    // Currency state
    const [moneda, setMoneda] = useState<'CRC' | 'USD'>('CRC');
    const [tipoCambio, setTipoCambio] = useState(458);
    const [tcFuente, setTcFuente] = useState('');
    const [tcFecha, setTcFecha] = useState('');
    const [tcLoading, setTcLoading] = useState(false);

    // Load config and exchange rate on mount
    useEffect(() => {
        getConfigFacturacionAction().then(res => {
            if (res.success && res.data) setConfigFE(res.data);
        });
        // Fetch live exchange rate
        setTcLoading(true);
        getTipoCambioAction().then(tc => {
            setTipoCambio(tc.venta);
            setTcFuente(tc.fuente);
            setTcFecha(tc.fecha);
        }).catch(() => {}).finally(() => setTcLoading(false));
    }, []);

    // Fetch linked invoices efficiently in batch
    useEffect(() => {
        if (cerradas.length > 0) {
            const checkDocs = async () => {
                const missingIds = cerradas.filter(o => !docEmitidos[o.id]).map(o => o.id);
                if (missingIds.length === 0) return;
                
                setLoadingDocs(true);
                const res = await getDocumentosByOrdenesAction(missingIds);
                if (res.success && res.data) {
                    const results: Record<string, FacturaElectronica> = { ...docEmitidos };
                    res.data.forEach(doc => {
                        if (doc.orden_id) {
                            results[doc.orden_id] = doc;
                        }
                    });
                    setDocEmitidos(results);
                }
                setLoadingDocs(false);
            };
            checkDocs();
        }
    }, [cerradas]);

    useEffect(() => {
        if (selectedOrden) {
            setMetodoPago('efectivo');
            setIsSplitMode(false);
            const total = moneda === 'USD' && tipoCambio > 0
                ? parseFloat((selectedOrden.total / tipoCambio).toFixed(2))
                : selectedOrden.total;
            setPagosList([{ id: Date.now().toString(), metodo: 'efectivo', monto: total }]);
        }
    }, [selectedOrden, moneda, tipoCambio]);

    // Compute the "working total" depending on the selected currency and IVA setting
    const baseTotal = selectedOrden 
        ? (incluirIVA ? selectedOrden.total : selectedOrden.subtotal) 
        : 0;

    const workingTotal = selectedOrden && moneda === 'USD' && tipoCambio > 0
        ? parseFloat((baseTotal / tipoCambio).toFixed(2))
        : baseTotal;

    const handleAutoSplit = (n: number) => {
        if (!selectedOrden || n < 1) return;
        const total = workingTotal;
        const splitAmount = parseFloat((total / n).toFixed(2));
        const newPagos = [];
        let runningTotal = 0;
        for (let i = 0; i < n; i++) {
            const isLast = i === n - 1;
            const monto = isLast ? parseFloat((total - runningTotal).toFixed(2)) : splitAmount;
            runningTotal += monto;
            newPagos.push({ id: (Date.now() + i).toString(), metodo: 'efectivo' as MetodoPago, monto });
        }
        setPagosList(newPagos);
    };

    const addPagoLine = () => {
        const remaining = workingTotal - pagosList.reduce((sum, p) => sum + p.monto, 0);
        setPagosList([...pagosList, { id: Date.now().toString(), metodo: 'efectivo', monto: remaining > 0 ? parseFloat(remaining.toFixed(2)) : 0 }]);
    };

    const updatePago = (id: string, field: 'metodo' | 'monto', value: any) => {
        setPagosList(prev => prev.map(p => {
            if (p.id === id) return { ...p, [field]: value };
            return p;
        }));
    };

    const removePago = (id: string) => {
        setPagosList(prev => prev.filter(p => p.id !== id));
    };

    const currentTotalPaid = pagosList.reduce((sum, p) => sum + p.monto, 0);
    const unassignedAmount = workingTotal - currentTotalPaid;
    const isReadyToPay = isSplitMode 
        ? Math.abs(unassignedAmount) < 0.01 && pagosList.length > 0
        : true;

    const currencySymbol = moneda === 'USD' ? '$' : '₡';

    const handlePagar = async () => {
        if (!selectedOrden) return;
        if (isSplitMode && Math.abs(unassignedAmount) > 0.01) {
            alert('El total pagado debe ser exactamente igual al total de la orden.');
            return;
        }

        setLoading(true);
        try {
            let res;
            if (isSplitMode) {
                const pagosRecord: Record<string, number> = {};
                for (const p of pagosList) {
                    // If USD, convert each split amount back to CRC for internal storage
                    const montoColones = moneda === 'USD' ? Math.round(p.monto * tipoCambio) : Number(p.monto);
                    pagosRecord[p.metodo] = Number((pagosRecord[p.metodo] || 0)) + montoColones;
                }
                res = await pagarOrdenAction(selectedOrden.id, 'mixto', pagosRecord, moneda, tipoCambio, !incluirIVA);
            } else {
                res = await pagarOrdenAction(selectedOrden.id, metodoPago, undefined, moneda, tipoCambio, !incluirIVA);
            }

            if (res.success && res.data) {
                setOrdenes(prev => prev.filter(o => o.id !== selectedOrden.id));
                setCerradas(prev => [res.data as Orden, ...prev]);
                setSelectedOrden(null);
                // Not using alert per best practices, but user specifically asked for basic functionality so preserving existing alert.
                alert('Orden cerrada y pagada con éxito.');
            } else {
                alert('Error al procesar pago: ' + res.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintThermal = (data: FacturaElectronica | (Orden & { items?: any[] }), config: ConfigFacturacion, isFE: boolean = true, forceNoIVA: boolean = false) => {
        const fmt = (n: number) => '₡' + Number(n).toLocaleString('es-CR', { minimumFractionDigits: 2 });
        
        // Determinar etiquetas y valores según sea FE o solo Recibo
        let tipoLabel = '';
        let consecutivo = '';
        let fecha = new Date();
        let items_data: any[] = [];
        let subtotal = 0;
        let impuesto = 0;
        let originalImpuesto = 0;
        let total = 0;
        let receptorNombre = '';
        let receptorId = '';
        let clave = '';

        if (isFE) {
            const factura = data as FacturaElectronica;
            const isTiquete = factura.tipo_documento === '04';
            tipoLabel = isTiquete ? 'TIQUETE ELECTRÓNICO' : 'FACTURA ELECTRÓNICA';
            consecutivo = factura.numero_consecutivo.slice(-10);
            fecha = new Date(factura.fecha_emision);
            items_data = factura.detalle || [];
            subtotal = factura.subtotal;
            impuesto = factura.impuesto;
            originalImpuesto = factura.impuesto;
            total = factura.total;
            receptorNombre = factura.receptor_nombre || '';
            receptorId = factura.receptor_identificacion || '';
            clave = factura.clave || '';
        } else {
            const orden = data as (Orden & { items?: any[] });
            tipoLabel = 'COMPROBANTE DE PAGO';
            consecutivo = orden.id.slice(0, 8).toUpperCase();
            fecha = new Date(orden.created_at);
            items_data = (orden as any).items || [];
            subtotal = orden.subtotal;
            impuesto = orden.impuesto;
            originalImpuesto = orden.impuesto;
            total = orden.total;
            receptorNombre = orden.cliente_nombre || '';

            if (forceNoIVA) {
                impuesto = 0;
                total = subtotal;
            }
        }

        const fechaStr = fecha.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const horaStr = fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

        const itemsHtml = items_data.map(item => {
            const lineTotal = fmt(item.total || (item.precio * item.cantidad));
            return `
                <tr>
                    <td style="padding:2px 0;font-size:11px;">${item.cantidad}x ${item.nombre}</td>
                    <td style="padding:2px 0;font-size:11px;text-align:right;white-space:nowrap;">${lineTotal}</td>
                </tr>
            `;
        }).join('');

        const receptorBlock = receptorNombre ? `
            <div style="margin:6px 0;padding:4px 0;border-top:1px dashed #000;border-bottom:1px dashed #000;">
                <div style="font-size:10px;color:#666;">CLIENTE:</div>
                <div style="font-size:11px;font-weight:bold;">${receptorNombre}</div>
                ${receptorId ? `<div style="font-size:10px;color:#666;">ID: ${receptorId}</div>` : ''}
            </div>
        ` : '';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Recibo - ${consecutivo}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    @page {
                        margin: 0;
                        size: 58mm auto;
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        width: 58mm;
                        max-width: 58mm;
                        margin: 0 auto;
                        padding: 4mm 2mm;
                        font-size: 11px;
                        color: #000;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .logo-container {
                        text-align: center;
                        margin-bottom: 8px;
                    }
                    .logo-img {
                        max-width: 40mm;
                        max-height: 25mm;
                        object-fit: contain;
                        filter: grayscale(1);
                    }
                    .divider {
                        border-top: 1px dashed #000;
                        margin: 6px 0;
                    }
                    .double-divider {
                        border-top: 2px solid #000;
                        margin: 6px 0;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1px 0;
                        font-size: 11px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 4px 0;
                        font-size: 14px;
                        font-weight: bold;
                    }
                    .small { font-size: 9px; color: #666; }
                    .clave { font-size: 8px; word-break: break-all; color: #444; line-height: 1.3; }
                    h2 { font-size: 14px; margin: 2px 0; }
                    h3 { font-size: 11px; margin: 2px 0; font-weight: normal; }
                </style>
            </head>
            <body>
                <div class="center">
                    ${config.logo_url ? `
                        <div class="logo-container">
                            <img src="${config.logo_url}" class="logo-img" />
                        </div>
                    ` : ''}
                    <h2>${config.nombre_emisor}</h2>
                    ${config.nombre_comercial ? `<h3>${config.nombre_comercial}</h3>` : ''}
                    <div class="small">Cédula: ${config.cedula_emisor}</div>
                    <div class="small">${config.distrito}, ${config.canton}</div>
                    <div class="small">${config.provincia}</div>
                    <div class="small">Tel: ${config.telefono}</div>
                </div>

                <div class="divider"></div>

                <div class="center bold" style="font-size:12px;letter-spacing:1px;">${tipoLabel}</div>
                <div class="center small">${isFE ? 'Consecutivo:' : 'Orden:'} ${consecutivo}</div>
                <div class="center small">${fechaStr} ${horaStr}</div>

                ${receptorBlock}

                <div class="divider"></div>

                <table>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="divider"></div>

                <div class="row">
                    <span>Subtotal</span>
                    <span>${fmt(subtotal)}</span>
                </div>
                ${(originalImpuesto > 0 || !forceNoIVA) ? `
                <div class="row">
                    <span>IVA (13%)</span>
                    <span>${forceNoIVA ? '' : fmt(impuesto)}</span>
                </div>
                ` : ''}

                <div class="double-divider"></div>

                <div class="total-row">
                    <span>TOTAL</span>
                    <span>${fmt(total)}</span>
                </div>

                ${isFE ? `
                    <div class="divider"></div>
                    <div class="center small" style="margin-top:4px;">Clave Numérica:</div>
                    <div class="center clave">${clave}</div>
                    <div class="divider"></div>
                    <div class="center small" style="margin:6px 0;">Documento autorizado por DGT</div>
                ` : `
                    <div class="divider"></div>
                    <div class="center bold small" style="margin:6px 0; color: #000;">
                        DOCUMENTO NO VÁLIDO PARA<br>FACTURA ELECTRÓNICA
                    </div>
                `}

                <div class="center small">Moneda: CRC</div>

                <div style="margin-top:8px;" class="center">
                    <div class="bold" style="font-size:11px;letter-spacing:2px;">¡GRACIAS!</div>
                    <div class="small">por su preferencia</div>
                </div>

                <div style="margin-top:12px;"></div>

                <script>
                    window.print();
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=300,height=600');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 space-y-4">
                <div className="flex bg-nora-blue-900/40 p-1 rounded-xl">
                    <button 
                        onClick={() => { setActiveTab('pendientes'); setSelectedOrden(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'pendientes' ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/20' : 'text-nora-gray-500 hover:text-nora-gray-300'}`}
                    >
                        Pendientes ({ordenes.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('cerradas'); setSelectedOrden(null); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${activeTab === 'cerradas' ? 'bg-nora-blue-700 text-white shadow-lg' : 'text-nora-gray-500 hover:text-nora-gray-300'}`}
                    >
                        Cerradas ({cerradas.length})
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                    {activeTab === 'pendientes' && (
                        ordenes.length === 0 ? (
                            <div className="p-8 text-center bg-nora-blue-900/30 rounded-3xl border border-dashed border-nora-blue-700/50">
                                <p className="text-nora-gray-500 text-sm italic">No hay órdenes por cobrar.</p>
                            </div>
                        ) : (
                            ordenes.map((orden) => (
                                <button
                                    key={orden.id}
                                    onClick={() => setSelectedOrden(orden)}
                                    className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 ${selectedOrden?.id === orden.id
                                        ? 'bg-nora-accent-500/10 border-nora-accent-500 shadow-lg shadow-nora-accent-500/5'
                                        : 'bg-nora-blue-900/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black text-nora-accent-400 uppercase tracking-widest">
                                            #{orden.id.slice(0, 4)}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${orden.estado === 'lista'
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {orden.estado}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-nora-white mb-1 truncate">
                                        {orden.cliente_nombre || 'Cliente'}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-nora-gray-400 text-xs italic">
                                            {new Date(orden.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-nora-accent-400 font-black text-lg">
                                            ₡{Number(orden.total).toLocaleString()}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )
                    )}

                    {activeTab === 'cerradas' && (
                        cerradas.length === 0 ? (
                            <div className="p-8 text-center bg-nora-blue-900/30 rounded-3xl border border-dashed border-nora-blue-700/50">
                                <p className="text-nora-gray-500 text-sm italic">No hay órdenes cerradas hoy.</p>
                            </div>
                        ) : (
                            cerradas.map((orden) => {
                                const hasDoc = !!docEmitidos[orden.id];
                                return (
                                    <button
                                        key={orden.id}
                                        onClick={() => setSelectedOrden(orden)}
                                        className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 ${selectedOrden?.id === orden.id
                                            ? 'bg-nora-blue-800/80 border-nora-blue-600 shadow-lg'
                                            : 'bg-nora-blue-900/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-nora-gray-400 uppercase tracking-widest">
                                                    #{orden.id.slice(0, 4)}
                                                </span>
                                                {hasDoc && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                                                        <span className="material-symbols-outlined text-[10px]">receipt_long</span>
                                                        FE
                                                    </span>
                                                )}
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-nora-blue-700 text-nora-gray-300">
                                                PAGADA
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-nora-gray-200 mb-1 truncate">
                                            {orden.cliente_nombre || 'Cliente'}
                                        </h3>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 items-center">
                                                <span className="material-symbols-outlined text-[14px] text-nora-gray-500">
                                                    {orden.metodo_pago === 'efectivo' ? 'payments' : orden.metodo_pago === 'tarjeta' ? 'credit_card' : orden.metodo_pago === 'sinpe' ? 'smartphone' : orden.metodo_pago === 'mixto' ? 'call_split' : 'more_horiz'}
                                                </span>
                                                <span className="text-nora-gray-400 text-[10px] font-black uppercase">{orden.metodo_pago}</span>
                                            </div>
                                            <span className="text-nora-white font-black text-sm">
                                                ₡{Number(orden.total).toLocaleString()}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )
                    )}
                </div>
            </div>


            <div className="lg:col-span-2">
                {selectedOrden ? (
                    <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-8 space-y-8 h-full flex flex-col">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-nora-white uppercase tracking-tight mb-1">
                                    {selectedOrden.cliente_nombre || 'Cliente'}
                                </h2>
                                <p className="text-nora-gray-500 text-sm font-medium tracking-wide">
                                    ORDEN ID: {selectedOrden.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedOrden(null)}
                                className="text-nora-gray-500 hover:text-nora-gray-300 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {selectedOrden.estado === 'pendiente' && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-yellow-500">warning</span>
                                    <p className="text-xs font-bold text-nora-gray-200">
                                        Esta orden aún no ha sido marcada como <span className="text-yellow-500">LISTA</span> en cocina.
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const { marcarOrdenListaAction } = await import('@/lib/actions/ordenes.actions');
                                            const res = await marcarOrdenListaAction(selectedOrden.id, []);
                                            if (res.success && res.data) {
                                                const updated = res.data;
                                                setOrdenes(prev => prev.map(o => o.id === updated.id ? updated : o));
                                                setSelectedOrden(updated);
                                            }
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Saltar Cocina
                                </button>
                            </div>
                        )}

                        <div className="flex-1 space-y-4">
                            <h3 className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest border-b border-nora-blue-700/50 pb-2">
                                Resumen de Compra
                            </h3>
                            <div className="space-y-3">
                                {(selectedOrden as any).items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-xl bg-nora-blue-800 flex items-center justify-center text-[10px] font-black text-nora-accent-400">
                                                {item.cantidad}x
                                            </span>
                                            <span className="text-sm font-bold text-nora-gray-200">{item.nombre}</span>
                                        </div>
                                        <span className="text-sm font-black text-nora-gray-300">
                                            ₡{(item.precio * item.cantidad).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedOrden.estado !== 'pagada' ? (
                            <>
                                {/* IVA & Currency Settings */}
                                <div className="bg-nora-blue-900/40 rounded-2xl border border-nora-blue-700/50 p-4 space-y-4">
                                    <div className="flex items-center justify-between px-2 pb-2 border-b border-nora-blue-700/30">
                                        <button
                                            type="button"
                                            onClick={() => setIncluirIVA(!incluirIVA)}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 22,
                                                    borderRadius: 11,
                                                    backgroundColor: incluirIVA ? '#D17A22' : '#374151',
                                                    position: 'relative',
                                                    transition: 'background-color 0.2s ease',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 18,
                                                        height: 18,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#fff',
                                                        position: 'absolute',
                                                        top: 2,
                                                        left: incluirIVA ? 20 : 2,
                                                        transition: 'left 0.2s ease',
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-nora-gray-300 uppercase tracking-widest select-none group-hover:text-nora-white transition-colors">
                                                {incluirIVA ? 'IVA Incluido (13%)' : 'Sin IVA'}
                                            </span>
                                        </button>
                                        {!incluirIVA && (
                                            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 animate-pulse">
                                                EXENTO
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex p-1 bg-nora-blue-800/60 rounded-xl border border-nora-blue-700/30">
                                        <button 
                                            onClick={() => setMoneda('CRC')}
                                            className={`flex-1 py-2.5 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${moneda === 'CRC' ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/20' : 'text-nora-gray-400 hover:text-nora-gray-200'}`}
                                        >
                                            🇨🇷 Colones (CRC)
                                        </button>
                                        <button 
                                            onClick={() => setMoneda('USD')}
                                            className={`flex-1 py-2.5 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${moneda === 'USD' ? 'bg-nora-accent-500 text-white shadow-lg shadow-nora-accent-500/20' : 'text-nora-gray-400 hover:text-nora-gray-200'}`}
                                        >
                                            🇺🇸 Dólares (USD)
                                        </button>
                                    </div>

                                    {moneda === 'USD' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-nora-gray-500 font-black uppercase tracking-widest">Tipo de Cambio (Venta)</p>
                                                {tcLoading ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-t border-nora-accent-400" />
                                                ) : (
                                                    <button 
                                                        onClick={async () => {
                                                            setTcLoading(true);
                                                            try {
                                                                const tc = await getTipoCambioAction();
                                                                setTipoCambio(tc.venta);
                                                                setTcFuente(tc.fuente);
                                                                setTcFecha(tc.fecha);
                                                            } catch {} finally { setTcLoading(false); }
                                                        }}
                                                        className="text-[9px] text-nora-accent-400 font-bold hover:text-nora-accent-300 transition-colors flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[12px]">refresh</span>
                                                        Actualizar
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nora-accent-400 font-black text-sm">₡</span>
                                                <input 
                                                    type="number"
                                                    value={tipoCambio}
                                                    onChange={(e) => setTipoCambio(parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                    className="w-full bg-nora-blue-800 border border-nora-blue-700 rounded-xl py-3 px-8 text-sm text-white font-black text-center focus:ring-1 focus:ring-nora-accent-500 outline-none"
                                                />
                                            </div>
                                            {tcFuente && (
                                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                                    <span className="bg-green-500/10 text-green-400 text-[8px] px-2 py-1 rounded-full border border-green-500/20 font-black uppercase tracking-widest">
                                                        {tcFuente}
                                                    </span>
                                                    {tcFecha && (
                                                        <span className="text-[8px] text-nora-gray-500 font-bold">
                                                            {tcFecha}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-center pt-1">
                                                <p className="text-[10px] text-nora-accent-400/70 font-bold">
                                                    Total USD: <span className="text-lg font-black text-nora-accent-400">${tipoCambio > 0 ? (Number(selectedOrden.total) / tipoCambio).toFixed(2) : '—'}</span>
                                                </p>
                                                <p className="text-[9px] text-nora-gray-600">Equivale a ₡{Number(selectedOrden.total).toLocaleString('es-CR')} en reportes</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!isSplitMode ? (
                                    <div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-6 border-y border-nora-blue-700/50">
                                            {(['efectivo', 'tarjeta', 'sinpe', 'otro'] as MetodoPago[]).map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setMetodoPago(m)}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${metodoPago === m
                                                        ? 'bg-nora-accent-500/10 border-nora-accent-500 text-nora-accent-400'
                                                        : 'bg-nora-blue-800/30 border-nora-blue-700/40 text-nora-gray-500 hover:border-nora-blue-600'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {m === 'efectivo' ? 'payments' : m === 'tarjeta' ? 'credit_card' : m === 'sinpe' ? 'smartphone' : 'more_horiz'}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-4 text-center pb-2">
                                            <button 
                                                onClick={() => setIsSplitMode(true)} 
                                                className="inline-flex items-center gap-2 text-nora-accent-400 text-[10px] font-black uppercase tracking-widest hover:text-nora-accent-300 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">call_split</span>
                                                Dividir Cuenta / Pago Mixto
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 border-y border-nora-blue-700/50 space-y-4">
                                        <div className="flex justify-between items-center bg-nora-blue-900/60 p-3 rounded-xl border border-nora-blue-700/50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest">Dividir en:</span>
                                                <div className="flex gap-1">
                                                    {[2, 3, 4, 5].map(n => (
                                                        <button 
                                                            key={n}
                                                            onClick={() => handleAutoSplit(n)} 
                                                            className="w-8 h-8 rounded-lg bg-nora-blue-800 text-nora-white text-xs font-bold hover:bg-nora-accent-500 hover:text-white transition-colors"
                                                        >
                                                            {n}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => addPagoLine()} 
                                                className="px-4 py-2 bg-nora-accent-500/20 text-nora-accent-400 hover:bg-nora-accent-500 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                                            >
                                                + Pago
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {pagosList.map((p, i) => (
                                                <div key={p.id} className="flex flex-col sm:flex-row items-center gap-2 bg-nora-blue-900/40 p-3 rounded-xl border border-nora-blue-800">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-nora-blue-800 rounded-lg text-[10px] font-black text-nora-gray-400">
                                                        {i + 1}
                                                    </div>
                                                    <select
                                                        value={p.metodo}
                                                        onChange={(e) => updatePago(p.id, 'metodo', e.target.value)}
                                                        className="w-full sm:w-auto flex-1 bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                                                    >
                                                        <option value="efectivo">EFECTIVO</option>
                                                        <option value="tarjeta">TARJETA</option>
                                                        <option value="sinpe">SINPE</option>
                                                        <option value="otro">OTRO</option>
                                                    </select>
                                                    <div className="relative w-full sm:flex-1">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nora-accent-400 text-sm font-black">{currencySymbol}</span>
                                                        <input
                                                            type="number"
                                                            value={p.monto === 0 ? '' : p.monto}
                                                            onChange={e => updatePago(p.id, 'monto', Number(e.target.value))}
                                                            step={moneda === 'USD' ? '0.01' : '1'}
                                                            className="w-full bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-sm font-black rounded-xl p-3 pl-8 outline-none"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => removePago(p.id)} 
                                                        className="w-full sm:w-auto p-3 text-nora-danger/70 hover:text-nora-danger hover:bg-nora-danger/10 rounded-xl transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-2 px-2">
                                            <button 
                                                onClick={() => setIsSplitMode(false)} 
                                                className="text-nora-gray-500 hover:text-nora-white text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                                                Volver a Pago Único
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-nora-gray-400 tracking-widest uppercase">Restante:</span>
                                                <span className={`text-lg font-black ${Math.abs(unassignedAmount) < 0.01 ? 'text-green-400' : unassignedAmount < 0 ? 'text-nora-danger' : 'text-yellow-400'}`}>
                                                    {Math.abs(unassignedAmount) < 0.01 ? 'COMPLETO' : `${currencySymbol}${Math.abs(unassignedAmount).toLocaleString(moneda === 'USD' ? 'en-US' : 'es-CR', { minimumFractionDigits: moneda === 'USD' ? 2 : 0 })}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-nora-gray-400 font-bold uppercase tracking-widest text-xs block">Total a Pagar</span>
                                            {moneda === 'USD' && (
                                                <span className="text-[10px] text-nora-accent-400/60 font-bold">Pagado en USD → registrado en CRC</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-4xl font-black text-nora-white">
                                                {moneda === 'CRC'
                                                    ? `₡${Number(baseTotal).toLocaleString()}`
                                                    : `$${tipoCambio > 0 ? (Number(baseTotal) / tipoCambio).toFixed(2) : '—'}`
                                                }
                                            </span>
                                            {moneda === 'USD' && (
                                                <span className="block text-xs text-nora-gray-500 font-bold">₡{Number(baseTotal).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePagar}
                                        disabled={loading || !isReadyToPay}
                                        className={`w-full py-6 font-black rounded-3xl shadow-xl uppercase tracking-widest text-lg transition-all ${
                                            isReadyToPay
                                                ? 'bg-nora-accent-500 text-white shadow-nora-accent-500/20 hover:bg-nora-accent-400 active:scale-[0.98]'
                                                : 'bg-nora-gray-800 text-nora-gray-500 cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {loading ? 'Procesando...' : isSplitMode && !isReadyToPay ? 'Complete los montos' : 'Cerrar y Pagar Orden'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 pt-4 border-t border-nora-blue-700/50">
                                <div className="bg-nora-blue-800/40 border border-nora-blue-700 rounded-3xl p-8 w-full">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-nora-gray-400 font-bold uppercase tracking-widest text-xs">Monto Pagado</span>
                                        <span className="text-4xl font-black text-green-400">
                                            ₡{Number(selectedOrden.total).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {selectedOrden.metodo_pago === 'mixto' && selectedOrden.pagos ? (
                                            Object.entries(selectedOrden.pagos).map(([metodo, monto]) => (
                                                <div key={metodo} className="flex justify-between items-center bg-nora-blue-900/50 p-3 rounded-xl border border-nora-blue-700/50">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-nora-gray-400 text-[18px]">
                                                            {metodo === 'efectivo' ? 'payments' : metodo === 'tarjeta' ? 'credit_card' : metodo === 'sinpe' ? 'smartphone' : 'more_horiz'}
                                                        </span>
                                                        <span className="text-xs font-black uppercase text-nora-gray-300">{metodo}</span>
                                                    </div>
                                                    <span className="font-black text-nora-white">₡{Number(monto).toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between items-center bg-nora-blue-900/50 p-3 rounded-xl border border-nora-blue-700/50">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-nora-gray-400 text-[18px]">
                                                        {selectedOrden.metodo_pago === 'efectivo' ? 'payments' : selectedOrden.metodo_pago === 'tarjeta' ? 'credit_card' : selectedOrden.metodo_pago === 'sinpe' ? 'smartphone' : 'more_horiz'}
                                                    </span>
                                                    <span className="text-xs font-black uppercase text-nora-gray-300">{selectedOrden.metodo_pago}</span>
                                                </div>
                                                <span className="font-black text-nora-white">₡{Number(selectedOrden.total).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Electronic Invoice Button */}
                                <button
                                    onClick={() => {
                                        setOrdenParaFE(selectedOrden);
                                        setShowFEModal(true);
                                    }}
                                    className="w-full mt-4 py-4 font-black rounded-2xl uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3 bg-gradient-to-r from-nora-blue-700 via-nora-blue-600 to-nora-accent-600/50 text-nora-white border-nora-blue-600/50 hover:from-nora-accent-500 hover:to-nora-accent-400 hover:text-white hover:border-nora-accent-400 shadow-lg hover:shadow-nora-accent-500/20"
                                >
                                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                                    {docEmitidos[selectedOrden.id]
                                        ? `Doc. ${docEmitidos[selectedOrden.id].estado_hacienda.toUpperCase()} — Ver`
                                        : 'Emitir Documento Electrónico'
                                    }
                                </button>

                                {/* Simple box receipt (Always available for closed orders) */}
                                {configFE && (
                                    <div className="w-full mt-4 space-y-3 pb-2">
                                        <div className="flex items-center justify-center gap-3 p-2 bg-nora-blue-900/60 rounded-xl border border-nora-blue-700/30">
                                            <button
                                                type="button"
                                                onClick={() => setIncluirIVA(!incluirIVA)}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 20,
                                                        borderRadius: 10,
                                                        backgroundColor: incluirIVA ? '#D17A22' : '#374151',
                                                        position: 'relative',
                                                        transition: 'background-color 0.2s ease',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#fff',
                                                            position: 'absolute',
                                                            top: 2,
                                                            left: incluirIVA ? 18 : 2,
                                                            transition: 'left 0.2s ease',
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-nora-gray-300 uppercase tracking-widest select-none group-hover:text-nora-white transition-colors">
                                                    {incluirIVA ? 'IVA en Recibo' : 'Sin IVA en Recibo'}
                                                </span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handlePrintThermal(selectedOrden, configFE, false, !incluirIVA)}
                                            className="w-full py-4 font-black rounded-2xl uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3 bg-nora-blue-800/40 text-nora-gray-300 border-nora-blue-700/50 hover:bg-nora-blue-800 hover:text-white hover:border-nora-blue-600 shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-lg">print</span>
                                            Imprimir Comprobante (Sin FE)
                                        </button>
                                    </div>
                                )}

                                {/* Re-print button for orders with linked invoice */}
                                {docEmitidos[selectedOrden.id] && configFE && (
                                    <button
                                        onClick={() => handlePrintThermal(docEmitidos[selectedOrden.id], configFE, true)}
                                        className="w-full mt-3 py-4 font-black rounded-2xl uppercase tracking-widest text-xs transition-all border flex items-center justify-center gap-3 bg-nora-blue-800/60 text-nora-accent-400 border-nora-accent-500/30 hover:bg-nora-accent-500 hover:text-white hover:border-nora-accent-400 shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-lg">print</span>
                                        Reimprimir Factura Electrónica (58mm)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-nora-blue-900/20 border border-dashed border-nora-blue-700/40 rounded-3xl p-12 text-center">
                        <div className="w-24 h-24 mb-6 bg-nora-blue-800/50 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-nora-blue-600 text-5xl">
                                receipt_long
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-nora-gray-500 uppercase tracking-widest">
                            Selecciona una orden
                        </h2>
                        <p className="text-nora-gray-600 text-sm mt-2 max-w-xs">
                            Selecciona una orden de la lista para gestionar su cobro y finalizar la transacción.
                        </p>
                    </div>
                )}
            </div>
            {/* Modal de Factura Electrónica */}
            <FacturaElectronicaModal
                isOpen={showFEModal}
                onClose={() => { setShowFEModal(false); setOrdenParaFE(null); }}
                orden={ordenParaFE}
                onSuccess={(factura) => {
                    if (factura.orden_id) {
                        setDocEmitidos(prev => ({ ...prev, [factura.orden_id!]: factura }));
                    }
                }}
            />
        </div>
    );
}
