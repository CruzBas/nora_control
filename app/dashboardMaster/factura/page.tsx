import { getOrdenesActivasAction, getPagadasHoyAction } from '@/lib/actions/ordenes.actions';
import FacturaClient from './FacturaClient';

export default async function FacturaPage() {
    const responseActivas = await getOrdenesActivasAction();
    const ordenes = responseActivas.success ? responseActivas.data || [] : [];

    const responseCerradas = await getPagadasHoyAction();
    const cerradas = responseCerradas.success ? responseCerradas.data || [] : [];

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-nora-gray-100 uppercase tracking-tight">
                    Facturación
                </h1>
                <p className="text-nora-gray-400 text-sm">
                    Gestión de cobros y cierre de órdenes activas.
                </p>
            </header>

            <FacturaClient initialOrdenes={ordenes} initialCerradas={cerradas} />
        </div>
    );
}
