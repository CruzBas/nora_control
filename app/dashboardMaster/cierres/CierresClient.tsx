'use client';

import { useState, useEffect } from 'react';
import { getCierresCajaAction } from '@/lib/actions/ordenes.actions';
import { CierreCaja } from '@/lib/types';
import { UserCircleIcon, CurrencyDollarIcon, BanknotesIcon, CreditCardIcon, DevicePhoneMobileIcon, PlusCircleIcon, PrinterIcon } from '@heroicons/react/24/outline';


export default function CierresClient() {
    const [cierres, setCierres] = useState<CierreCaja[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCierres();
    }, []);

    const cargarCierres = async () => {
        setLoading(true);
        const res = await getCierresCajaAction();
        if (res.success && res.data) {
            setCierres(res.data);
        }
        setLoading(false);
    };

    const fmt = (n: number) => `₡${n.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

    const imprimir = (cierre: CierreCaja) => {
        const windowPrint = window.open('', '', 'width=800,height=600');
        if (windowPrint) {
            windowPrint.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset="utf-8">
                <title>Cierre de Caja - ${cierre.fecha}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .ticket { max-width: 350px; margin: 0 auto; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
                    h2, h3, h4 { text-align: center; margin: 5px 0; }
                    .row { display: flex; justify-content: space-between; margin: 8px 0; }
                    .divider { border-top: 1px dashed #000; margin: 15px 0; }
                    .bold { font-weight: bold; }
                    .text-center { text-align: center; }
                </style>
                </head>
                <body>
                  <div class="ticket">
                     <h2>NORA</h2>
                     <h3>Cierre de Caja</h3>
                     <div class="text-center" style="margin-bottom: 10px;">
                        Usuario: ${cierre.usuario?.nombre || 'Desconocido'} ${cierre.usuario?.apellido || ''}
                     </div>
                     <div class="divider"></div>
                     <div class="row"><span>Fecha:</span><span>${new Date(cierre.created_at).toLocaleString('es-CR')}</span></div>
                     <div class="row"><span>Órdenes Generadas:</span><span>${cierre.ordenes_count}</span></div>
                     <div class="divider"></div>
                     <div class="row"><span>Efectivo:</span><span>${fmt(cierre.total_efectivo)}</span></div>
                     <div class="row"><span>Tarjeta:</span><span>${fmt(cierre.total_tarjeta)}</span></div>
                     <div class="row"><span>SINPE:</span><span>${fmt(cierre.total_sinpe)}</span></div>
                     <div class="row"><span>Otro:</span><span>${fmt(cierre.total_otro)}</span></div>
                     <div class="divider"></div>
                     <div class="row bold" style="font-size: 18px;"><span>TOTAL:</span><span>${fmt(cierre.total_general)}</span></div>
                     <div class="divider"></div>
                     <div class="text-center" style="font-size: 12px; margin-top:20px;">
                        Reporte generado automáticamente.
                     </div>
                  </div>
                  <script>
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { 
                            window.close();
                        }, 500);
                    }, 500);
                  </script>
                </body>
                </html>
            `);
            windowPrint.document.close();
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Cierres de Caja</h1>
                    <p className="text-nora-gray-400 mt-1">Historial de todos los cierres registrados en el sistema</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-nora-accent-500"></div>
                </div>
            ) : cierres.length === 0 ? (
                <div className="bg-nora-blue-800/50 rounded-3xl p-12 text-center border border-nora-blue-700">
                    <p className="text-nora-gray-400">No se encontraron cierres de caja registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cierres.map((cierre) => (
                        <div key={cierre.id} className="bg-nora-blue-800 rounded-3xl p-6 border border-nora-blue-700 shadow-xl overflow-hidden relative group hover:border-nora-accent-500/50 transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-nora-accent-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 text-nora-accent-400 font-bold mb-1">
                                        <CurrencyDollarIcon className="h-5 w-5" />
                                        <span>{new Date(cierre.created_at).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    </div>
                                    <div className="text-nora-gray-400 text-xs flex items-center gap-1">
                                        <span>Hora: {new Date(cierre.created_at).toLocaleTimeString('es-CR')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => imprimir(cierre)}
                                    className="p-2 bg-nora-blue-700 hover:bg-nora-accent-500 text-nora-gray-300 hover:text-white rounded-xl transition-all"
                                    title="Imprimir"
                                >
                                    <PrinterIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 bg-nora-blue-900/50 p-3 rounded-2xl border border-nora-blue-700/50 mb-4">
                                <div className="p-2 bg-nora-blue-800 rounded-xl">
                                    <UserCircleIcon className="h-6 w-6 text-nora-gray-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">
                                        {cierre.usuario?.nombre || 'Usuario Desconocido'} {cierre.usuario?.apellido || ''}
                                    </p>
                                    <p className="text-xs text-nora-gray-400">
                                        Responsable {cierre.usuario?.rol?.nombre ? `(${cierre.usuario.rol.nombre})` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center bg-nora-blue-900/30 p-2 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 text-nora-gray-300">
                                        <BanknotesIcon className="h-4 w-4" /> Efectivo
                                    </div>
                                    <span className="font-bold text-white">{fmt(cierre.total_efectivo)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-nora-blue-900/30 p-2 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 text-nora-gray-300">
                                        <CreditCardIcon className="h-4 w-4" /> Tarjeta
                                    </div>
                                    <span className="font-bold text-white">{fmt(cierre.total_tarjeta)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-nora-blue-900/30 p-2 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 text-nora-gray-300">
                                        <DevicePhoneMobileIcon className="h-4 w-4" /> SINPE
                                    </div>
                                    <span className="font-bold text-white">{fmt(cierre.total_sinpe)}</span>
                                </div>
                                {cierre.total_otro > 0 && (
                                    <div className="flex justify-between items-center bg-nora-blue-900/30 p-2 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 text-nora-gray-300">
                                            <PlusCircleIcon className="h-4 w-4" /> Otro
                                        </div>
                                        <span className="font-bold text-white">{fmt(cierre.total_otro)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-nora-blue-700 pt-4 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-nora-gray-400 font-bold uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-2xl font-black text-nora-accent-400">
                                        {fmt(cierre.total_general)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-3 py-1 bg-nora-blue-700/50 text-nora-gray-300 rounded-full text-xs font-bold border border-nora-blue-600">
                                        {cierre.ordenes_count} Órdenes
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
