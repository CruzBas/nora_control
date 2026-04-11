'use client';

import { useState, useEffect, useRef } from 'react';
import { CabysItem } from '@/lib/types';
import { consultarCabysAction } from '@/lib/actions/factura-electronica.actions';

interface CabysSelectorProps {
    value: string;
    onSelect: (item: CabysItem) => void;
    label?: string;
}

export default function CabysSelector({ value, onSelect, label = "Código CABYS" }: CabysSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<CabysItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CabysItem | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load if value exists
    useEffect(() => {
        if (value && !selectedItem) {
            handleSearch(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (term: string) => {
        if (!term || term.length < 3) return;
        setLoading(true);
        try {
            const res = await consultarCabysAction(term);
            if (res.success && res.data) {
                setResults(res.data);
                setShowResults(true);
                if (value && term === value && res.data.length > 0) {
                    setSelectedItem(res.data[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length < 3) {
            setResults([]);
            setShowResults(false);
        }
    };


    useEffect(() => {
        if (searchTerm.length >= 3) {
            const timeoutId = setTimeout(() => handleSearch(searchTerm), 500);
            return () => clearTimeout(timeoutId);
        }
    }, [searchTerm]);


    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-[10px] font-bold text-nora-gray-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                <span>{label}</span>
                {selectedItem && (
                    <span className="text-nora-accent-400 normal-case font-normal text-[9px]">
                        IVA: {(selectedItem.impuesto * 100).toFixed(0)}%
                    </span>
                )}
            </label>

            <div className="relative">
                <input
                    type="text"
                    value={searchTerm || value}
                    onChange={onSearchChange}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    placeholder="Buscar por nombre o código (ej. Café)..."
                    className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500 outline-none transition-all pr-12"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-nora-accent-500"></div>
                    ) : (
                        <span className="material-symbols-outlined text-nora-gray-500 text-lg">search</span>
                    )}
                </div>
            </div>

            {selectedItem && !searchTerm && (
                <p className="mt-2 text-[10px] text-nora-accent-400 font-bold px-1 line-clamp-1">
                    ✓ {selectedItem.descripcion}
                </p>
            )}

            {showResults && results.length > 0 && (
                <div className="absolute z-[100] mt-2 w-full bg-nora-blue-800 border border-nora-blue-700 rounded-2xl shadow-2xl max-h-[250px] overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    {results.map((item) => (
                        <button
                            key={item.codigo}
                            type="button"
                            onClick={() => {
                                onSelect(item);
                                setSelectedItem(item);
                                setSearchTerm('');
                                setShowResults(false);
                            }}
                            className="w-full text-left p-4 hover:bg-nora-accent-500/10 border-b border-nora-blue-700/30 last:border-0 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black text-nora-accent-500 uppercase tracking-widest">{item.codigo}</span>
                                <span className="bg-nora-blue-900 text-[9px] px-2 py-0.5 rounded-full text-nora-gray-400 group-hover:text-nora-accent-400">
                                    IVA {(item.impuesto * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-xs text-nora-gray-100 font-bold line-clamp-2 leading-relaxed">{item.descripcion}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
