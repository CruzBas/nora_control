'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    listarSolicitudesAction,
    aprobarSolicitudAction,
    rechazarSolicitudAction,
} from '@/lib/actions/solicitudes.actions';

interface Solicitud {
    id: string;
    pagina: string;
    motivo: string | null;
    estado: string;
    acceso_hasta: string | null;
    created_at: string;
    usuario: {
        nombre: string | null;
        apellido: string | null;
        email: string | null;
    };
}

const DURACIONES = [
    { label: '1 hora', horas: 1 },
    { label: '4 horas', horas: 4 },
    { label: '8 horas', horas: 8 },
    { label: '24 horas', horas: 24 },
    { label: '1 semana', horas: 168 },
];

const PAGINA_LABELS: Record<string, string> = {
    home: 'Inicio',
    orden: 'Orden / POS',
    cocina: 'Cocina',
    facturas: 'Facturas',
    inventario: 'Inventario',
    reportes: 'Reportes',
    admin: 'Panel Admin',
};

const ESTADO_BADGE: Record<string, { label: string; class: string }> = {
    pendiente: { label: 'Pendiente', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    aprobada: { label: 'Aprobada', class: 'bg-nora-success/20 text-nora-success border-nora-success/30' },
    rechazada: { label: 'Rechazada', class: 'bg-nora-danger/20 text-nora-danger border-nora-danger/30' },
    expirada: { label: 'Expirada', class: 'bg-nora-gray-500/20 text-nora-gray-400 border-nora-gray-500/30' },
};

export default function SolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<'pendiente' | 'todas'>('pendiente');

    const fetchSolicitudes = useCallback(async () => {
        setLoading(true);
        const res = await listarSolicitudesAction();
        if (res.success && res.data) {
            setSolicitudes(res.data as Solicitud[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSolicitudes();
    }, [fetchSolicitudes]);

    const handleAprobar = async (id: string, horas: number) => {
        setProcesando(id);
        await aprobarSolicitudAction(id, horas);
        await fetchSolicitudes();
        setProcesando(null);
    };

    const handleRechazar = async (id: string) => {
        setProcesando(id);
        await rechazarSolicitudAction(id);
        await fetchSolicitudes();
        setProcesando(null);
    };

    const solicitudesFiltradas = filtro === 'pendiente'
        ? solicitudes.filter(s => s.estado === 'pendiente')
        : solicitudes;

    return (
        <div className="flex flex-col min-h-screen bg-nora-blue-900">
            <div className="p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-nora-gray-100 tracking-tight">
                            Solicitudes de Acceso
                        </h1>
                        <p className="text-nora-gray-400 mt-1 font-medium">
                            {solicitudes.filter(s => s.estado === 'pendiente').length} solicitudes pendientes
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFiltro('pendiente')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtro === 'pendiente'
                                ? 'bg-nora-accent-500 text-white'
                                : 'bg-nora-blue-800 text-nora-gray-400 hover:text-white border border-nora-blue-700'
                                }`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setFiltro('todas')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtro === 'todas'
                                ? 'bg-nora-accent-500 text-white'
                                : 'bg-nora-blue-800 text-nora-gray-400 hover:text-white border border-nora-blue-700'
                                }`}
                        >
                            Todas
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-nora-accent-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : solicitudesFiltradas.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 bg-nora-blue-800/20 border-2 border-dashed border-nora-blue-700 rounded-3xl text-center">
                        <span className="text-5xl mb-4">✅</span>
                        <p className="text-nora-gray-400 font-bold text-xl">
                            {filtro === 'pendiente' ? 'No hay solicitudes pendientes' : 'No hay solicitudes'}
                        </p>
                        <p className="text-nora-gray-500 text-sm mt-1">
                            Las solicitudes de acceso de los empleados aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    /* Lista de solicitudes */
                    <div className="space-y-4">
                        {solicitudesFiltradas.map((sol) => (
                            <div
                                key={sol.id}
                                className="bg-nora-blue-800/40 border border-nora-blue-700/50 rounded-3xl p-5 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Info */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-black text-nora-gray-100">
                                                {sol.usuario?.nombre || ''} {sol.usuario?.apellido || ''}
                                            </span>
                                            <span className="text-nora-gray-500 text-xs">
                                                {sol.usuario?.email}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ESTADO_BADGE[sol.estado]?.class || ''}`}>
                                                {ESTADO_BADGE[sol.estado]?.label || sol.estado}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-[16px] text-nora-gray-500">
                                                lock
                                            </span>
                                            <span className="text-nora-gray-300 font-medium">
                                                Solicita acceso a: <strong className="text-nora-accent-400">{PAGINA_LABELS[sol.pagina] || sol.pagina}</strong>
                                            </span>
                                        </div>
                                        {sol.motivo && (
                                            <p className="text-nora-gray-400 text-sm italic">
                                                &ldquo;{sol.motivo}&rdquo;
                                            </p>
                                        )}
                                        <p className="text-nora-gray-600 text-xs">
                                            {new Date(sol.created_at).toLocaleDateString('es-CR', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            })}
                                            {sol.acceso_hasta && sol.estado === 'aprobada' && (
                                                <> · Acceso hasta: {new Date(sol.acceso_hasta).toLocaleDateString('es-CR', {
                                                    day: '2-digit', month: 'short',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}</>
                                            )}
                                        </p>
                                    </div>

                                    {/* Acciones */}
                                    {sol.estado === 'pendiente' && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {DURACIONES.map((d) => (
                                                <button
                                                    key={d.horas}
                                                    onClick={() => handleAprobar(sol.id, d.horas)}
                                                    disabled={procesando === sol.id}
                                                    className="px-3 py-2 bg-nora-success/10 hover:bg-nora-success/20 border border-nora-success/30 text-nora-success text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handleRechazar(sol.id)}
                                                disabled={procesando === sol.id}
                                                className="px-3 py-2 bg-nora-danger/10 hover:bg-nora-danger/20 border border-nora-danger/30 text-nora-danger text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
