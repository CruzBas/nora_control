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
        <header className="h-16 bg-nora-blue-800/80 backdrop-blur-md border-b border-nora-blue-700/50 flex items-center justify-between px-8 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-nora-gray-100 tracking-tight">
                {title}
            </h2>
            <div className={showMenu ? "flex space-x-2" : "flex space-x-2"}>
                {showMenu && tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-2 text-sm font-bold transition-all duration-200 rounded-lg ${activeTab === tab.id
                            ? 'text-nora-accent-400 border-b-2 border-nora-accent-400 bg-nora-accent-500/10'
                            : 'text-nora-gray-400 hover:text-nora-gray-100 hover:bg-nora-blue-700/50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </header>
    );
}
