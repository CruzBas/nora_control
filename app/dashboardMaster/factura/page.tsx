import { getOrdenesActivasAction, getPagadasHoyAction } from '@/lib/actions/ordenes.actions';
import FacturaClient from './FacturaClient';

export default async function FacturaPage() {
    const responseActivas = await getOrdenesActivasAction();
    const ordenes = responseActivas.success ? responseActivas.data || [] : [];

    const responseCerradas = await getPagadasHoyAction();
    const cerradas = responseCerradas.success ? responseCerradas.data || [] : [];

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-nora-gray-100 uppercase tracking-tight">
                        Facturación
                    </h1>
                    <p className="text-nora-gray-400 text-sm">
                        Gestión de cobros, cierre de órdenes y facturación electrónica.
                    </p>
                </div>
                <div className="flex gap-2">
                    <a
                        href="/dashboardMaster/factura/historial"
                        className="px-4 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 hover:border-nora-accent-500 text-nora-gray-300 hover:text-nora-accent-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">history</span>
                        Historial FE
                    </a>
                    <a
                        href="/dashboardMaster/factura/config"
                        className="px-4 py-2.5 bg-nora-blue-800/60 border border-nora-blue-700/50 hover:border-nora-accent-500 text-nora-gray-300 hover:text-nora-accent-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">settings</span>
                        Config FE
                    </a>
                </div>
            </header>

            <FacturaClient initialOrdenes={ordenes} initialCerradas={cerradas} />
        </div>
    );
}
