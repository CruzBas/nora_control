'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUsuario } from '@/lib/hooks/useUsuario';
import { tieneAcceso, rutaAPagina, type Pagina } from '@/lib/permissions';
import AccesoDenegadoModal from './common/AccesoDenegadoModal';
import UpgradePlanModal from './common/UpgradePlanModal';

interface LinkItem {
    name: string;
    href: string;
    icon: string;
    pagina: Pagina;
}

const allLinks: LinkItem[] = [
    { name: 'Inicio', href: '/dashboardMaster', icon: 'home', pagina: 'home' },
    { name: 'Orden', href: '/dashboardMaster/ventas', icon: 'receipt_long', pagina: 'orden' },
    { name: 'Facturación', href: '/dashboardMaster/factura', icon: 'payments', pagina: 'factura' },
    { name: 'Cocina', href: '/dashboardMaster/cocina', icon: 'kitchen', pagina: 'cocina' },
    { name: 'Inventario', href: '/dashboardMaster/inventario', icon: 'inventory_2', pagina: 'inventario' },
    { name: 'Reportes', href: '/dashboardMaster/reportes', icon: 'bar_chart', pagina: 'reportes' },
    { name: 'Proveedores', href: '/dashboardMaster/proveedores', icon: 'inventory', pagina: 'proveedores' },
    { name: 'Cierres', href: '/dashboardMaster/cierres', icon: 'point_of_sale', pagina: 'cierres' },
    { name: 'Solicitudes', href: '/dashboardMaster/solicitudes', icon: 'approval', pagina: 'solicitudes' },
    { name: 'Organizaciones', href: '/dashboardMaster/organizaciones', icon: 'corporate_fare', pagina: 'organizaciones' },
];

const bottomLinks = [
    { name: 'Cerrar Sesión', href: '/', icon: 'logout' },
];

interface NavLinksMasterProps {
    onLinkClick?: () => void;
}

export default function NavLinksMaster({ onLinkClick }: NavLinksMasterProps) {
    const pathname = usePathname();
    const { usuario, tieneAccesoTemporal } = useUsuario();
    const [modalOpen, setModalOpen] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [modalPagina, setModalPagina] = useState<{ pagina: string; label: string }>({ pagina: '', label: '' });

    const rol = usuario?.rol || 'Cajero';
    const suscripcion = usuario?.suscripcion;

    const isActive = (href: string) => pathname === href;

    const baseLinkClasses =
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group';
    const activeLinkClasses =
        'bg-nora-accent-500/15 text-nora-accent-400 font-semibold';
    const inactiveLinkClasses =
        'text-nora-gray-300 hover:bg-nora-blue-700/50 hover:text-nora-gray-100';
    const lockedLinkClasses =
        'text-nora-gray-500 hover:bg-nora-blue-700/30 hover:text-nora-gray-400 cursor-pointer';


    const visibleLinks = allLinks.filter(link => {
        const { tiene } = tieneAcceso(rol, link.pagina, suscripcion);
        return tiene !== undefined;
    });

    const handleLinkClick = (e: React.MouseEvent, link: LinkItem) => {
        const { tiene, motivo } = tieneAcceso(rol, link.pagina, suscripcion);


        if (tiene === true || tieneAccesoTemporal(link.pagina)) {
            onLinkClick?.();
            return;
        }


        e.preventDefault();
        setModalPagina({ pagina: link.pagina, label: link.name });
        
        if (motivo === 'suscripcion') {
            setUpgradeModalOpen(true);
        } else {
            setModalOpen(true);
        }
    };

    return (
        <>

            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                {visibleLinks.map((link) => {
                    const { tiene } = tieneAcceso(rol, link.pagina, suscripcion);
                    const isLocked = tiene === false && !tieneAccesoTemporal(link.pagina);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link)}
                            className={`${baseLinkClasses} ${isActive(link.href)
                                ? activeLinkClasses
                                : isLocked
                                    ? lockedLinkClasses
                                    : inactiveLinkClasses
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[20px] ${isActive(link.href)
                                    ? 'text-nora-accent-400'
                                    : isLocked
                                        ? 'text-nora-gray-600'
                                        : 'text-nora-gray-400 group-hover:text-nora-gray-200'
                                    }`}
                            >
                                {link.icon}
                            </span>
                            <span className="text-sm flex-1">{link.name}</span>
                            {isLocked && (
                                <span className="material-symbols-outlined text-[16px] text-nora-gray-600">
                                    lock
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>


            <div className="px-4 pb-2 space-y-1 border-t border-nora-blue-700/50 pt-3">
                {bottomLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onLinkClick}
                        className={`${baseLinkClasses} ${isActive(link.href) ? activeLinkClasses : inactiveLinkClasses
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined text-[20px] ${isActive(link.href)
                                ? 'text-nora-accent-400'
                                : 'text-nora-gray-400 group-hover:text-nora-gray-200'
                                }`}
                        >
                            {link.icon}
                        </span>
                        <span className="text-sm font-medium">{link.name}</span>
                    </Link>
                ))}
            </div>


            <AccesoDenegadoModal
                isOpen={modalOpen}
                pagina={modalPagina.pagina}
                paginaLabel={modalPagina.label}
                onClose={() => setModalOpen(false)}
            />

            <UpgradePlanModal
                isOpen={upgradeModalOpen}
                paginaLabel={modalPagina.label}
                onClose={() => setUpgradeModalOpen(false)}
            />
        </>
    );
}