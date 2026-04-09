'use client';

import { useInventory } from '@/lib/hooks/hooks';

export default function AlertasReabastecimiento() {
    const { ingredients, loading } = useInventory();

    if (loading) return null;

    // Filtrar los ingredientes que están por debajo o igual al mínimo
    const alertas = ingredients.filter(item => item.cantidad <= item.minimo);

    if (alertas.length === 0) return null;

    const handleWhatsAppClick = (item: any) => {
        if (!item.proveedor) {
            alert('No hay un proveedor asignado a este producto. Por favor edita el producto y asigna uno primero.');
            return;
        }

        if (!item.proveedor.contacto) {
            alert('El proveedor asignado no tiene un número de contacto registrado.');
            return;
        }

        const numero = item.proveedor.contacto.replace(/\D/g, ''); // Remover caracteres que no sean dígitos
        const reorderQty = item.cantidad_reorden && item.cantidad_reorden > 0 ? item.cantidad_reorden : item.minimo * 2;
        
        const mensaje = `Hola ${item.proveedor.nombre}, necesito solicitar el siguiente pedido:%0A%0A- *${reorderQty} ${item.unidad_medida}* de *${item.producto}*.%0A%0A¡Muchas gracias!`;
        
        const url = `https://wa.me/${numero}?text=${mensaje}`;
        window.open(url, '_blank');
    };

    return (
        <div className="mb-8 p-6 bg-nora-danger/10 border border-nora-danger/30 rounded-3xl animate-in slide-in-from-top-4 duration-500 shadow-lg shadow-nora-danger/5 backdrop-blur-sm">
            <h3 className="text-xl font-black text-nora-danger mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">warning</span>
                Alertas de Reabastecimiento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertas.map(item => (
                    <div key={item.id} className="bg-nora-blue-900 border border-nora-danger/20 p-4 rounded-2xl flex flex-col justify-between hover:border-nora-danger/40 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-nora-gray-100">{item.name}</h4>
                                <span className="text-xs font-black bg-nora-danger/20 text-nora-danger px-2 py-1 rounded-md text-center">
                                    {item.cantidad} {item.unidad_medida}
                                </span>
                            </div>
                            <p className="text-sm text-nora-gray-400 mb-1">Mínimo: {item.minimo} {item.unidad_medida}</p>
                            {item.proveedor ? (
                                <p className="text-sm font-medium text-nora-info flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                                    {item.proveedor.nombre}
                                </p>
                            ) : (
                                <p className="text-sm text-nora-gray-500 italic flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">help</span>
                                    Sin proveedor asignado
                                </p>
                            )}
                        </div>
                        
                        <button
                            onClick={() => handleWhatsAppClick(item)}
                            className={`mt-4 w-full py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 ${
                                item.proveedor && item.proveedor.contacto 
                                    ? 'bg-[#25D366] text-white hover:bg-[#1ebe57] shadow-lg shadow-green-500/20' 
                                    : 'bg-nora-blue-700/50 text-nora-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">chat</span>
                            {item.proveedor && item.proveedor.contacto ? 'Pedir por WhatsApp' : 'Faltan Datos'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
