import { getClientesFacturacionAction } from '@/lib/actions/clientes-facturacion.actions';
import ClientesList from './ClientesList';

export const dynamic = 'force-dynamic';

export default async function ClientesFacturacionPage() {
    const res = await getClientesFacturacionAction();
    const clientes = res.success && res.data ? res.data : [];

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-nora-white uppercase tracking-tight">
                        Clientes FE
                    </h1>
                    <p className="text-nora-gray-400 text-sm mt-1">
                        Libreta de direcciones y clientes frecuentes para Facturación Electrónica.
                    </p>
                </div>
            </header>

            <ClientesList initialClientes={clientes} />
        </div>
    );
}
