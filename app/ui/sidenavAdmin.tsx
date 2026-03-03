'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import NavLinksAdmin from './nav-links-admin';

export default function SidenavAdmin() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();


    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);


    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);


    const sidebarContent = (
        <>

            <Link href="/dashboardAdmin" className="p-5 flex items-center gap-3 group">
                <div className="bg-nora-accent-500 rounded-lg p-1.5 flex items-center justify-center shadow-[var(--nora-shadow-accent)] transition-transform duration-200 group-hover:scale-105">
                    <span className="material-symbols-outlined text-white text-[22px]">
                        dashboard_customize
                    </span>
                </div>
                <div>
                    <h1 className="text-base font-bold tracking-tight text-nora-gray-100 leading-none">
                        Nora Control
                    </h1>
                    <p className="text-[11px] text-nora-gray-400 font-medium mt-0.5">
                        Administración
                    </p>
                </div>
            </Link>


            <NavLinksAdmin onLinkClick={() => setMobileOpen(false)} />


            <div className="p-4 border-t border-nora-blue-700/50">
                <div className="flex items-center gap-3 px-3 py-3 bg-nora-blue-800/60 rounded-xl">
                    <div className="h-9 w-9 rounded-full bg-nora-blue-600 overflow-hidden shrink-0 border-2 border-nora-blue-700">
                        <img
                            alt="Nora"
                            className="h-full w-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ4OuTxLPcitMRZsNWroOly4oh-rAEOQhZFHWGOLOVhilCz5dtDwCZX2AqnPOn5FT5wXzJl1uVqv3l3L9vhmdLyGtmjk_JqzuyMYogZdXztr3Fbu598ex1dJrwyNTkN8plpweURBktVaAo9gkoFCffMS0U-ehJGBdKAUf_9OXBWWlEqqvWGIW5uPR7w99LjAkcbf2Q7kZCHuxm9sa_1XvmxzhTOOcuODLbXQAhoU-eZ2bvaaHTVLi-pDXcAKXi5CWJ8HOcQTuuxbeV"
                        />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-nora-gray-100 truncate">
                            Nora Business
                        </p>
                        <p className="text-[10px] text-nora-gray-400 truncate">
                            nora@control.com
                        </p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>

            <div className="md:hidden flex items-center justify-between bg-nora-blue-800 px-4 py-3 border-b border-nora-blue-700/50 sticky top-0 z-40">
                <Link href="/dashboardAdmin" className="flex items-center gap-2">
                    <div className="bg-nora-accent-500 rounded-lg p-1 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[18px]">
                            dashboard_customize
                        </span>
                    </div>
                    <span className="text-sm font-bold text-nora-gray-100">
                        Nora Control
                    </span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                    className="p-2 rounded-lg text-nora-gray-300 hover:bg-nora-blue-700/50 hover:text-nora-gray-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-[24px]">
                        {mobileOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>


            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}
            <aside
                className={`
                    md:hidden fixed top-0 left-0 z-50 h-full w-64
                    bg-nora-blue-800 border-r border-nora-blue-700/50
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {sidebarContent}
            </aside>


            <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 h-full bg-nora-blue-800 border-r border-nora-blue-700/50">
                {sidebarContent}
            </aside>
        </>
    );
}