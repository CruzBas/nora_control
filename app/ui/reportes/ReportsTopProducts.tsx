interface ProductSale {
    name: string;
    quantity: number;
    revenue: string;
}

interface ReportsTopProductsProps {
    products?: ProductSale[];
}

export default function ReportsTopProducts({ products = [] }: ReportsTopProductsProps) {
    return (
        <div className="bg-nora-blue-800/40 rounded-3xl border border-nora-blue-700/30 overflow-hidden shadow-sm flex flex-col backdrop-blur-sm">
            <div className="p-6 border-b border-nora-blue-700/50 flex justify-between items-center bg-nora-blue-800/60">
                <h2 className="text-lg font-black text-nora-gray-100 tracking-tight">Ventas por Producto</h2>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-nora-blue-900/50 border-b border-nora-blue-700/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest">
                                Producto
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-center">
                                Cant.
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-widest text-right">
                                Ingresos
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nora-blue-700/30">
                        {products.length > 0 ? (
                            products.map((product, idx) => (
                                <tr key={idx} className="hover:bg-nora-blue-700/20 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-nora-gray-200">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-nora-gray-300 text-center">
                                        {product.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-nora-success text-right">
                                        {product.revenue}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-10 text-center text-nora-gray-400 font-medium">
                                    No hay datos disponibles para el periodo seleccionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
