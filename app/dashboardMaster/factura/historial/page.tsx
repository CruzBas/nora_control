'use client';

import { useState, useEffect } from 'react';
import { FacturaElectronica, EstadoHacienda, TipoDocumentoFE } from '@/lib/types';
import { getDocumentosFEAction, getStatsFEAction } from '@/lib/actions/factura-electronica.actions';

const ESTADO_COLORS: Record<string, string> = {
    pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    enviado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    aceptado: 'bg-green-500/10 text-green-400 border-green-500/30',
    rechazado: 'bg-red-500/10 text-red-400 border-red-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const ESTADO_ICONS: Record<string, string> = {
    pendiente: 'schedule',
    enviado: 'cloud_upload',
    aceptado: 'check_circle',
    rechazado: 'cancel',
    error: 'error',
};

const TIPO_DOC_NAMES: Record<string, string> = {
    '01': 'Factura',
    '02': 'Nota Débito',
    '03': 'Nota Crédito',
    '04': 'Tiquete',
    '08': 'Compras',
    '09': 'Exportación',
};

export default function HistorialFEPage() {
    const [documentos, setDocumentos] = useState<FacturaElectronica[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, aceptados: 0, rechazados: 0, pendientes: 0 });
    const [filtroEstado, setFiltroEstado] = useState<EstadoHacienda | ''>('');
    const [filtroTipo, setFiltroTipo] = useState<TipoDocumentoFE | ''>('');
    const [selectedDoc, setSelectedDoc] = useState<FacturaElectronica | null>(null);

    useEffect(() => {
        loadData();
    }, [filtroEstado, filtroTipo]);

    const loadData = async () => {
        setLoading(true);
        const [docsRes, statsRes] = await Promise.all([
            getDocumentosFEAction({
                estado: filtroEstado || undefined,
                tipo: filtroTipo || undefined,
                limit: 100,
            }),
            getStatsFEAction(),
        ]);

        if (docsRes.success && docsRes.data) setDocumentos(docsRes.data);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <a
                        href="/dashboardMaster/factura"
                        className="p-2 bg-nora-blue-800/60 rounded-xl hover:bg-nora-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-nora-gray-400">arrow_back</span>
                    </a>
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 uppercase tracking-tight">
                            Historial FE
                        </h1>
                        <p className="text-nora-gray-400 text-sm">
                            Documentos electrónicos emitidos y su estado en Hacienda.
                        </p>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: stats.total, icon: 'receipt_long', color: 'text-nora-accent-400' },
                    { label: 'Aceptados', value: stats.aceptados, icon: 'check_circle', color: 'text-green-400' },
                    { label: 'Pendientes', value: stats.pendientes, icon: 'schedule', color: 'text-blue-400' },
                    { label: 'Rechazados', value: stats.rechazados, icon: 'cancel', color: 'text-red-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                            <span className="text-[10px] font-black text-nora-gray-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <span className="text-3xl font-black text-nora-white">{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as EstadoHacienda | '')}
                    className="bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="error">Error</option>
                </select>
                <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as TipoDocumentoFE | '')}
                    className="bg-nora-blue-800 border border-nora-blue-700 focus:border-nora-accent-500 text-nora-white text-xs font-bold rounded-xl p-3 outline-none"
                >
                    <option value="">Todos los tipos</option>
                    <option value="01">Factura (01)</option>
                    <option value="04">Tiquete (04)</option>
                    <option value="03">Nota Crédito (03)</option>
                    <option value="02">Nota Débito (02)</option>
                </select>
                <button
                    onClick={loadData}
                    className="px-4 bg-nora-blue-800 border border-nora-blue-700 hover:bg-nora-blue-700 text-nora-gray-300 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Actualizar
                </button>
            </div>

            {/* Document List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-nora-accent-500" />
                    <p className="text-nora-gray-400 text-sm">Cargando documentos...</p>
                </div>
            ) : documentos.length === 0 ? (
                <div className="p-12 text-center bg-nora-blue-900/30 rounded-3xl border border-dashed border-nora-blue-700/50">
                    <span className="material-symbols-outlined text-5xl text-nora-blue-600 mb-4 block">folder_off</span>
                    <p className="text-nora-gray-500 text-sm font-bold">No se encontraron documentos electrónicos.</p>
                    <p className="text-nora-gray-600 text-xs mt-1">Emite un tiquete o factura desde el módulo de facturación.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-380px)] pr-2 custom-scrollbar">
                        {documentos.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${selectedDoc?.id === doc.id
                                    ? 'bg-nora-accent-500/10 border-nora-accent-500 shadow-lg shadow-nora-accent-500/5'
                                    : 'bg-nora-blue-900/40 border-nora-blue-700/40 hover:border-nora-blue-600'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest">
                                        {TIPO_DOC_NAMES[doc.tipo_documento] || doc.tipo_documento}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ESTADO_COLORS[doc.estado_hacienda]}`}>
                                        {doc.estado_hacienda}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-bold text-nora-gray-200 truncate max-w-[180px]">
                                            {doc.receptor_nombre || 'Consumidor Final'}
                                        </p>
                                        <p className="text-[10px] text-nora-gray-500 mt-0.5">
                                            {new Date(doc.fecha_emision).toLocaleDateString('es-CR', {
                                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className="text-sm font-black text-nora-accent-400">
                                        ₡{Number(doc.total).toLocaleString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Detail */}
                    <div className="lg:col-span-2">
                        {selectedDoc ? (
                            <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-3xl p-6 space-y-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-black text-nora-white uppercase tracking-tight">
                                            {TIPO_DOC_NAMES[selectedDoc.tipo_documento]}
                                        </h2>
                                        <p className="text-nora-gray-500 text-xs mt-0.5">
                                            {new Date(selectedDoc.fecha_emision).toLocaleDateString('es-CR', {
                                                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${ESTADO_COLORS[selectedDoc.estado_hacienda]}`}>
                                        <span className="material-symbols-outlined text-sm">
                                            {ESTADO_ICONS[selectedDoc.estado_hacienda]}
                                        </span>
                                        {selectedDoc.estado_hacienda}
                                    </span>
                                </div>

                                {selectedDoc.mensaje_hacienda && (
                                    <div className={`p-3 rounded-xl border ${ESTADO_COLORS[selectedDoc.estado_hacienda]}`}>
                                        <p className="text-xs">{selectedDoc.mensaje_hacienda}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3 bg-nora-blue-800/30 rounded-2xl p-4 border border-nora-blue-700/30">
                                        <h3 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest">Clave Numérica</h3>
                                        <p className="text-[10px] font-mono text-nora-gray-300 break-all leading-relaxed">{selectedDoc.clave}</p>
                                    </div>
                                    <div className="space-y-3 bg-nora-blue-800/30 rounded-2xl p-4 border border-nora-blue-700/30">
                                        <h3 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest">Consecutivo</h3>
                                        <p className="text-sm font-mono font-bold text-nora-gray-300">{selectedDoc.numero_consecutivo}</p>
                                    </div>
                                </div>

                                {/* Receptor */}
                                {selectedDoc.receptor_nombre && (
                                    <div className="bg-nora-blue-800/30 rounded-2xl p-4 border border-nora-blue-700/30">
                                        <h3 className="text-[10px] font-black text-nora-accent-400 uppercase tracking-widest mb-2">Receptor</h3>
                                        <p className="text-sm font-bold text-nora-white">{selectedDoc.receptor_nombre}</p>
                                        {selectedDoc.receptor_identificacion && (
                                            <p className="text-xs text-nora-gray-400 mt-0.5">Cédula: {selectedDoc.receptor_identificacion}</p>
                                        )}
                                        {selectedDoc.receptor_email && (
                                            <p className="text-xs text-nora-gray-400">Email: {selectedDoc.receptor_email}</p>
                                        )}
                                    </div>
                                )}

                                {/* Line items */}
                                <div>
                                    <h3 className="text-[10px] font-black text-nora-gray-400 uppercase tracking-widest border-b border-nora-blue-700/50 pb-2 mb-3">
                                        Detalle
                                    </h3>
                                    <div className="space-y-2">
                                        {(selectedDoc.detalle || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-lg bg-nora-blue-800 flex items-center justify-center text-[10px] font-black text-nora-accent-400">
                                                        {item.cantidad}
                                                    </span>
                                                    <span className="text-xs font-bold text-nora-gray-300">{item.nombre}</span>
                                                </div>
                                                <span className="text-xs font-black text-nora-gray-400">
                                                    ₡{item.total.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t border-nora-blue-700/50 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs text-nora-gray-400">
                                        <span>Subtotal</span>
                                        <span>₡{Number(selectedDoc.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-nora-gray-400">
                                        <span>IVA (13%)</span>
                                        <span>₡{Number(selectedDoc.impuesto).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-nora-white">
                                        <span>Total</span>
                                        <span className="text-nora-accent-400">₡{Number(selectedDoc.total).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-nora-blue-900/20 border border-dashed border-nora-blue-700/40 rounded-3xl p-12 text-center min-h-[400px]">
                                <span className="material-symbols-outlined text-5xl text-nora-blue-600 mb-4">description</span>
                                <h2 className="text-lg font-black text-nora-gray-500 uppercase tracking-widest">
                                    Selecciona un documento
                                </h2>
                                <p className="text-nora-gray-600 text-sm mt-2 max-w-xs">
                                    Selecciona un documento de la lista para ver su detalle completo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
