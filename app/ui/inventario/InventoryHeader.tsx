interface InventoryHeaderProps {
    title: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    showMenu?: boolean;
    showRecetas?: boolean;
}

export default function InventoryHeader({ title, activeTab, onTabChange, showMenu = true, showRecetas = true }: InventoryHeaderProps) {
    const tabs = [
        { id: 'insumos', label: 'Insumos' },
        { id: 'menu', label: 'Menú Principal (POS)' },
        { id: 'recetas', label: 'Recetas' },
    ];

    return (
        <header className="min-h-16 bg-nora-blue-800/80 backdrop-blur-md border-b border-nora-blue-700/50 flex flex-col sm:flex-row items-center justify-between px-4 md:px-8 sticky top-0 z-10 py-3 sm:py-0">
            <h2 className="text-lg md:text-xl font-bold text-nora-gray-100 tracking-tight mb-3 sm:mb-0">
                {title}
            </h2>
            <div className="flex overflow-x-auto max-w-full no-scrollbar pb-1 sm:pb-0">
                <div className="flex space-x-1 md:space-x-2 whitespace-nowrap">
                    {tabs.map((tab) => {
                        if (tab.id === 'menu' && !showMenu) return null;
                        if (tab.id === 'recetas' && !showRecetas) return null;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-bold transition-all duration-200 rounded-lg ${activeTab === tab.id
                                    ? 'text-nora-accent-400 border-b-2 border-nora-accent-400 bg-nora-accent-500/10'
                                    : 'text-nora-gray-400 hover:text-nora-gray-100 hover:bg-nora-blue-700/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
