'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category: string;
}

interface ProductCardProps {
    product: Product;
    onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    return (
        <button
            onClick={onClick}
            className="group relative bg-nora-blue-800 rounded-[2rem] p-4 lg:p-5 border border-nora-blue-700 hover:border-nora-accent-500 transition-all duration-500 flex flex-col items-start text-left hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-nora-accent-500/10 active:scale-[0.98] w-full h-full"
        >

            <div className="w-full aspect-square sm:aspect-video lg:aspect-square xl:aspect-video bg-linear-to-br from-nora-blue-900 to-nora-blue-800 rounded-[1.5rem] mb-4 lg:mb-5 overflow-hidden flex items-center justify-center text-5xl lg:text-6xl group-hover:scale-105 transition-transform duration-700 border border-nora-blue-700/50 shadow-inner">
                <span className="drop-shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
                    {product.category === 'drinks' ? '🥤' : product.category === 'food' ? '🍔' : '🍱'}
                </span>
            </div>

            <div className="flex flex-col flex-1 justify-between w-full">
                <div className="mb-3 lg:mb-5">
                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-nora-accent-400 mb-1 lg:mb-2 block opacity-70">
                        {product.category}
                    </span>
                    <h3 className="text-nora-white font-bold text-base lg:text-lg xl:text-xl leading-tight group-hover:text-nora-accent-300 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between w-full pt-3 lg:pt-4 border-t border-nora-blue-700/50 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-nora-gray-500 font-black uppercase tracking-widest opacity-60">Precio</span>
                        <span className="text-lg lg:text-xl xl:text-2xl font-black text-nora-white tracking-tighter">
                            ₡{product.price.toLocaleString('es-CR')}
                        </span>
                    </div>
                    <div className="p-2 lg:p-3 bg-linear-to-br from-nora-accent-500 to-nora-accent-600 rounded-2xl text-nora-white group-hover:scale-110 transition-all shadow-lg shadow-nora-accent-500/30 group-hover:shadow-nora-accent-400/50">
                        <PlusIcon className="h-5 w-5 lg:h-6 lg:w-6 stroke-[3]" />
                    </div>
                </div>
            </div>
        </button>
    );
}
