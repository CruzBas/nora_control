'use client';

import { FacturaElectronica, ConfigFacturacion } from '@/lib/types';

interface FacturaVisualProps {
    factura: FacturaElectronica;
    config: ConfigFacturacion;
}

export default function FacturaVisual({ factura, config }: FacturaVisualProps) {
    const fmt = (val: number) => '₡' + Number(val).toLocaleString('es-CR', { minimumFractionDigits: 2 });
    
    const isTiquete = factura.tipo_documento === '04';
    const title = isTiquete ? 'TIQUETE ELECTRÓNICO' : 'FACTURA ELECTRÓNICA';

    return (
        <div className="bg-white text-slate-800 p-8 rounded-lg shadow-inner font-sans max-w-[800px] mx-auto overflow-hidden print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">{config.nombre_emisor}</h1>
                    {config.nombre_comercial && (
                        <p className="text-slate-500 font-bold text-sm mb-4 uppercase">{config.nombre_comercial}</p>
                    )}
                    <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                        <p>Cédula: {config.cedula_emisor}</p>
                        <p>{config.distrito}, {config.canton}, {config.provincia}</p>
                        <p>{config.otras_senas}</p>
                        <p>Tel: {config.telefono} | {config.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-slate-100 px-4 py-2 rounded-xl inline-block mb-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
                        <p className="text-lg font-black text-slate-900 leading-none mt-1">{factura.numero_consecutivo.slice(-10)}</p>
                    </div>
                    <div className="text-[11px] text-slate-500">
                        <p className="font-bold">Fecha de Emisión</p>
                        <p>{new Date(factura.fecha_emision).toLocaleDateString('es-CR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p>{new Date(factura.fecha_emision).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>

            {/* Receptor */}
            {factura.receptor_nombre && (
                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">CLIENTE / RECEPTOR</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-black text-slate-900">{factura.receptor_nombre}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">ID: {factura.receptor_identificacion || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] text-slate-500">{factura.receptor_email || ''}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="text-left py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cant.</th>
                        <th className="text-left py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                        <th className="text-right py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</th>
                        <th className="text-right py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {(factura.detalle || []).map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-4 text-sm font-bold text-slate-400">{item.cantidad}</td>
                            <td className="py-4">
                                <p className="text-sm font-black text-slate-800">{item.nombre}</p>
                                {item.codigo_cabys && (
                                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">CABYS: {item.codigo_cabys}</p>
                                )}
                            </td>
                            <td className="py-4 text-right text-sm font-medium text-slate-600">{fmt(item.precio_unitario)}</td>
                            <td className="py-4 text-right text-sm font-black text-slate-900">{fmt(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals & Footer Info */}
            <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t-2 border-slate-100">
                <div className="flex-1">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block w-full">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clave Numérica de Hacienda</h3>
                        <p className="text-[10px] font-mono text-slate-500 break-all leading-relaxed tracking-tighter">
                            {factura.clave}
                        </p>
                    </div>
                    <div className="mt-6 text-[10px] text-slate-400 font-medium leading-relaxed">
                        <p>Autorizada mediante resolución de la DGT para la emisión de comprobantes electrónicos.</p>
                        <p className="mt-1">Moneda: {factura.moneda} | Situación: Normal</p>
                    </div>
                </div>
                <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        <span>Subtotal</span>
                        <span>{fmt(factura.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                        <span>IVA (13%)</span>
                        <span>{fmt(factura.impuesto)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <span className="text-base font-black text-slate-900">Total</span>
                        <span className="text-xl font-black text-slate-900">{fmt(factura.total)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Gracias por su preferencia</p>
            </div>
        </div>
    );
}
