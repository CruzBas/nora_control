'use client';

const CATEGORY_ICONS: Record<string, string> = {
    all: '🍽️',
    bebidas: '🥤',
    comidas: '🍔',
    postres: '🍰',
    snacks: '🍿',
    otros: '🍱',
    desayunos: '☕',
    almuerzos: '🍱',
    cenas: '🌙',
};

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
    const allTabs = [
        { id: 'all', name: 'Todos', icon: '🍽️' },
        ...categories.map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: CATEGORY_ICONS[cat.toLowerCase()] ?? '🍱',
        })),
    ];

    return (
        <div className="p-4 flex space-x-3 overflow-x-auto bg-nora-blue-900 border-b border-nora-blue-800 no-scrollbar sticky top-16 z-20 backdrop-blur-md bg-opacity-50">
            {allTabs.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap
                        ${activeCategory === category.id
                            ? 'bg-nora-accent-500 text-nora-white shadow-lg shadow-nora-accent-500/20'
                            : 'bg-nora-blue-800 text-nora-gray-400 border border-nora-blue-700 hover:bg-nora-blue-700 hover:text-nora-white'
                        }`}
                >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                </button>
            ))}
        </div>
    );
}
