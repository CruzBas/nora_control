'use client';

import { MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VentasHeader() {
    return (
        <header className="h-auto min-h-[4rem] py-3 lg:py-0 lg:h-16 bg-nora-blue-800 border-b border-nora-blue-700 flex flex-col lg:flex-row items-center justify-between px-4 lg:px-6 sticky top-0 z-30 backdrop-blur-md bg-opacity-80 gap-3 lg:gap-0">
            <div className="flex items-center w-full lg:w-auto justify-between lg:justify-start">
                <Link
                    href="/dashboardAdmin"
                    className="mr-2 lg:mr-4 p-2 text-nora-gray-400 hover:text-nora-accent-400 hover:bg-nora-blue-700 rounded-lg transition-all"
                >
                    <ArrowLeftIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                </Link>
                <h1 className="text-lg lg:text-xl font-black text-nora-white uppercase tracking-tight truncate">Punto de Venta</h1>


                <div className="lg:hidden h-8 w-8 rounded-full bg-nora-blue-700 border border-nora-blue-600 flex items-center justify-center text-nora-white font-bold text-[10px]">
                    AU
                </div>
            </div>

            <div className="w-full lg:flex-1 lg:max-w-md lg:mx-8 order-3 lg:order-2">
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-nora-gray-400 group-focus-within:text-nora-accent-400 transition-colors">
                        <MagnifyingGlassIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-9 pr-4 py-2 lg:py-2.5 bg-nora-blue-900 border border-nora-blue-700 text-nora-gray-100 placeholder-nora-gray-500 focus:bg-nora-blue-700 focus:border-nora-accent-400 focus:ring-2 focus:ring-nora-accent-400/20 rounded-xl transition-all outline-none text-sm"
                    />
                </div>
            </div>


        </header>
    );
}
