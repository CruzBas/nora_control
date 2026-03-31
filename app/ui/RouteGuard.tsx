'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUsuario } from '@/lib/hooks/useUsuario';
import { tieneAcceso, rutaAPagina } from '@/lib/permissions';
import AccesoDenegadoModal from './common/AccesoDenegadoModal';

const PAGINA_LABELS: Record<string, string> = {
    home: 'Inicio',
    orden: 'Orden',
    cocina: 'Cocina',
    facturas: 'Facturas',
    inventario: 'Inventario',
    reportes: 'Reportes',
    admin: 'Panel Admin',
    solicitudes: 'Solicitudes',
};

interface RouteGuardProps {
    children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
    const pathname = usePathname();
    const { usuario, loading, tieneAccesoTemporal } = useUsuario();
    const [bloqueado, setBloqueado] = useState(false);
    const [paginaBloqueada, setPaginaBloqueada] = useState('');

    useEffect(() => {
        if (loading || !usuario) return;

        const pagina = rutaAPagina(pathname);
        if (!pagina) {
            setBloqueado(false);
            return;
        }

        const acceso = tieneAcceso(usuario.rol, pagina);

        if (acceso === true || acceso === undefined) {
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

    return (
        <>
            {bloqueado ? (
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
            ) : (
                children
            )}
        </>
    );
}
