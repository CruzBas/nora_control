'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


const links = [
  {
    name: 'Pedidos',
    href: '/dashboardCocina',
    icon: 'receipt_long',
  },
  {
    name: 'Inventario',
    href: '/dashboardCocina/inventario',
    icon: 'inventory',
  },
  {
    name: 'Pedidos Completados',
    href: '/dashboardCocina/pedidosCompletados',
    icon: 'done_all',
  },
];

const bottomLinks = [
  {
    name: 'Cerrar Sesión',
    href: '/',
    icon: 'logout',
  },
];

interface NavLinksCocinaProps {
  onLinkClick?: () => void;
}

export default function NavLinksCocina({ onLinkClick }: NavLinksCocinaProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const baseLinkClasses =
    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group';
  const activeLinkClasses =
    'bg-nora-accent-500/15 text-nora-accent-400 font-semibold';
  const inactiveLinkClasses =
    'text-nora-gray-300 hover:bg-nora-blue-700/50 hover:text-nora-gray-100';

  return (
    <>
      {/* ── Main links ── */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {links.map((link) => (
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
            <span className="text-sm">{link.name}</span>
          </Link>
        ))}
      </nav>

      {/* ── Bottom links ── */}
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
    </>

  );
}