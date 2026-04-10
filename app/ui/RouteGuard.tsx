'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUsuario } from '@/lib/hooks/useUsuario';
import { tieneAcceso, rutaAPagina, type MotivoBloqueo } from '@/lib/permissions';


const PAGINA_LABELS: Record<string, string> = {
    home: 'Inicio',
    orden: 'Orden',
    cocina: 'Cocina',
    inventario: 'Inventario',
    reportes: 'Reportes',
    admin: 'Panel Admin',
    solicitudes: 'Solicitudes',
    cierres: 'Cierres',
    organizaciones: 'Organizaciones',
};

interface RouteGuardProps {
    children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
    const pathname = usePathname();
    const { usuario, loading, tieneAccesoTemporal } = useUsuario();
    const [bloqueado, setBloqueado] = useState(false);
    const [paginaBloqueada, setPaginaBloqueada] = useState('');
    const [motivoBloqueo, setMotivoBloqueo] = useState<MotivoBloqueo | undefined>(undefined);

    useEffect(() => {
        if (loading || !usuario) return;

        const pagina = rutaAPagina(pathname);
        if (!pagina) {
            setBloqueado(false);
            return;
        }

        const { tiene, motivo } = tieneAcceso(usuario.rol, pagina, usuario.suscripcion);
        setMotivoBloqueo(motivo);

        if (tiene === true || tiene === undefined) {
            setBloqueado(false);
        } else if (tieneAccesoTemporal(pagina)) {
            setBloqueado(false);
        } else {
            setBloqueado(true);
            setPaginaBloqueada(pagina);
        }
    }, [pathname, usuario, loading, tieneAccesoTemporal]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-nora-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!usuario?.suscripcion) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center px-4">
                <div className="w-24 h-24 mb-8 bg-red-500/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-5xl">
                        payments
                    </span>
                </div>
                <h2 className="text-3xl font-black text-nora-gray-100 mb-4">
                    Cuenta Inactiva
                </h2>
                <div className="bg-nora-blue-800/40 p-6 rounded-2xl border border-nora-blue-700/50 max-w-lg">
                    <p className="text-nora-gray-300 text-lg mb-2 text-balance">
                        Tu acceso ha sido restringido por falta de suscripción activa.
                    </p>
                    <p className="text-red-400 font-bold text-xl mb-6">
                        Estado: Pendiente de Pago
                    </p>
                    <p className="text-nora-gray-400 text-sm">
                        Por favor, contacta al administrador para regularizar tu plan y recuperar el acceso.
                    </p>
                </div>
            </div>
        );
    }

    const renderBloqueo = () => {
        if (motivoBloqueo === 'suscripcion') {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
                    <div className="w-20 h-20 mb-6 bg-nora-accent-500/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-nora-accent-400 text-4xl">
                            rocket_launch
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-nora-white mb-2">
                        Plan Superior Requerido
                    </h2>
                    <p className="text-nora-gray-400 text-sm max-w-md mb-8">
                        El módulo de <strong className="text-nora-accent-400">{PAGINA_LABELS[paginaBloqueada] || paginaBloqueada}</strong> no está incluido en tu plan actual. Mejora tu suscripción para desbloquear esta funcionalidad.
                    </p>
                    <a
                        href={`mailto:admin.tools@noratechgroup.com?subject=Mejora de Plan: ${PAGINA_LABELS[paginaBloqueada] || paginaBloqueada}`}
                        className="px-8 py-4 bg-nora-accent-500 text-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 uppercase tracking-widest text-xs"
                    >
                        Solicitar Mejora de Plan
                    </a>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 mb-6 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-400 text-4xl">
                        lock
                    </span>
                </div>
                <h2 className="text-2xl font-black text-nora-gray-100 mb-2">
                    Acceso Restringido
                </h2>
                <p className="text-nora-gray-400 text-sm max-w-md mb-6">
                    No tienes permiso para acceder a esta sección.
                    Puedes solicitar acceso temporal a un administrador desde el menú lateral.
                </p>
            </div>
        );
    };

    return (
        <>
            {bloqueado ? renderBloqueo() : children}
        </>
    );
}
