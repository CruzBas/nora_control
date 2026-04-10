'use client';

import { useState } from 'react';
import { FacturaElectronica, TIPO_DOCUMENTO_LABELS, ESTADO_HACIENDA_CONFIG, EstadoHacienda } from '@/lib/types/facturacion';

interface Props {
    facturas: FacturaElectronica[];
    loading: boolean;
    onRefresh: () => void;
}

export default function FacturasList({ facturas, loading, onRefresh }: Props) {
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [busqueda, setBusqueda] = useState('');

    const fmt = (val: number) => new Intl.NumberFormat('es-CR', {
        style: 'currency', currency: 'CRC', maximumFractionDigits: 0
    }).format(val);

    const filtradas = facturas.filter(f => {
        if (filtroEstado !== 'todos' && f.estado_hacienda !== filtroEstado) return false;
        if (filtroTipo !== 'todos' && f.tipo_documento !== filtroTipo) return false;
        if (busqueda) {
            const q = busqueda.toLowerCase();
            return (
                f.clave_hacienda.toLowerCase().includes(q) ||
                f.consecutivo.toLowerCase().includes(q) ||
                f.cliente_fiscal?.nombre?.toLowerCase().includes(q) ||
                f.total_comprobante.toString().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-nora-gray-500 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por clave, consecutivo o cliente..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 rounded-xl text-nora-gray-200 placeholder:text-nora-gray-600 text-sm focus:outline-none focus:border-nora-accent-500/50 transition-colors"
                    />
                </div>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="px-4 py-2.5 bg-nora-blue-800 border border-nora-blue-700/50 rounded-xl text-nora-gray-300 text-sm focus:outline-none focus:border-nora-accent-500/50"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">🟡 Pendiente</option>
                    <option value="enviado">🔵 Enviado</option>
                    <option value="aceptado">✅ Aceptado</option>
                    <option value="rechazado">❌ Rechazado</option>
                    <option value="error">⚠️ Error</option>
                </select>
                <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="px-4 py-2.5 bg-nora-blue-800 border border-nora-blue-700/50 rounded-xl text-nora-gray-300 text-sm focus:outline-none focus:border-nora-accent-500/50"
                >
                    <option value="todos">Todos los tipos</option>
                    <option value="FE">Factura Electrónica</option>
                    <option value="NC">Nota de Crédito</option>
                    <option value="ND">Nota de Débito</option>
                    <option value="TE">Tiquete Electrónico</option>
                </select>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2.5 bg-nora-blue-800 border border-nora-blue-700/50 rounded-xl text-nora-gray-300 hover:text-white hover:border-nora-accent-500/50 transition-all text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Actualizar
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: facturas.length, icon: 'description', color: 'text-nora-accent-400' },
                    { label: 'Aceptadas', value: facturas.filter(f => f.estado_hacienda === 'aceptado').length, icon: 'check_circle', color: 'text-emerald-400' },
                    { label: 'Pendientes', value: facturas.filter(f => f.estado_hacienda === 'pendiente' || f.estado_hacienda === 'enviado').length, icon: 'schedule', color: 'text-yellow-400' },
                    { label: 'Rechazadas', value: facturas.filter(f => f.estado_hacienda === 'rechazado' || f.estado_hacienda === 'error').length, icon: 'error', color: 'text-red-400' },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-nora-blue-800/50 border border-nora-blue-700/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`material-symbols-outlined text-lg ${kpi.color}`}>{kpi.icon}</span>
                            <span className="text-xs text-nora-gray-500 font-medium">{kpi.label}</span>
                        </div>
                        <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-nora-accent-500/30 border-t-nora-accent-500 rounded-full animate-spin" />
                </div>
            ) : filtradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl text-center">
                    <span className="text-5xl mb-4">📄</span>
                    <p className="text-nora-gray-400 font-bold text-xl">No hay facturas</p>
                    <p className="text-nora-gray-500 text-sm mt-1">Las facturas emitidas aparecerán aquí.</p>
                </div>
            ) : (
                <div className="bg-nora-blue-800/30 border border-nora-blue-700/30 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-nora-blue-700/40">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Consecutivo</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider">Monto</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-nora-gray-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-nora-blue-700/20">
                                {filtradas.map(f => {
                                    const estado = ESTADO_HACIENDA_CONFIG[f.estado_hacienda as EstadoHacienda] || ESTADO_HACIENDA_CONFIG.pendiente;
                                    return (
                                        <tr key={f.id} className="hover:bg-nora-blue-800/40 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-bold text-nora-accent-400 bg-nora-accent-500/10 px-2 py-1 rounded-lg border border-nora-accent-500/20">
                                                    {TIPO_DOCUMENTO_LABELS[f.tipo_documento] || f.tipo_documento}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-nora-gray-200 text-xs font-mono">{f.consecutivo || '—'}</p>
                                                <p className="text-[10px] text-nora-gray-600 font-mono mt-0.5 truncate max-w-[200px]">{f.clave_hacienda || '—'}</p>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <p className="text-nora-gray-300 font-medium">{f.cliente_fiscal?.nombre || 'General'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${estado.class}`}>
                                                    <span>{estado.emoji}</span>
                                                    {estado.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-black text-nora-gray-200">{fmt(f.total_comprobante)}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-nora-gray-400 text-xs">
                                                    {new Date(f.fecha_emision).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
