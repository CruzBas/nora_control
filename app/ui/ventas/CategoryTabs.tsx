'use client';

const categories = [
    { id: 'all', name: 'Todos', icon: '🍽️' },
    { id: 'drinks', name: 'Bebidas', icon: '🥤' },
    { id: 'food', name: 'Comidas', icon: '🍔' },
    { id: 'desserts', name: 'Postres', icon: '🍰' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
];

export default function CategoryTabs() {
    return (
        <div className="p-4 flex space-x-3 overflow-x-auto bg-nora-blue-900 border-b border-nora-blue-800 no-scrollbar sticky top-16 z-20 backdrop-blur-md bg-opacity-50">
            {categories.map((category) => (
                <button
                    key={category.id}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center space-x-2 whitespace-nowrap
            ${category.id === 'all'
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
