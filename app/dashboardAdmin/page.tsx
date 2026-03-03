import MetricCard from '../ui/MetricCard';
import SalesChart from '../ui/SalesChart';
import TransactionsTable from '../ui/TransactionsTable';

export default function DashboardAdminPage() {
    return (
        <div className="flex flex-col min-h-full">


            <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl md:text-3xl font-black text-nora-gray-100 tracking-tight leading-tight">
                        Resumen de Negocio
                    </h3>
                    <p className="text-nora-gray-400 font-medium text-sm md:text-base">
                        Bienvenida de nuevo, Nora. Esto es lo que sucede hoy.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <MetricCard
                        title="Ventas de Hoy"
                        value="₡120,000.00"
                        icon="payments"
                        iconColorClass="text-nora-success"
                        iconBgClass="bg-nora-success/10"
                        badge="+12.5%"
                        badgeColorClass="text-nora-success bg-nora-success/10"
                    />
                    <MetricCard
                        title="Facturas Activas"
                        value="14"
                        icon="description"
                        iconColorClass="text-nora-info"
                        iconBgClass="bg-nora-info/10"
                    />
                    <MetricCard
                        title="Alertas de Stock"
                        value="5"
                        icon="warning"
                        iconColorClass="text-nora-danger"
                        iconBgClass="bg-nora-danger/10"
                        badge="Prioridad"

                    />
                </div>

                <SalesChart />

                <TransactionsTable />
            </div>

            <footer className="px-4 md:px-8 py-6 border-t border-nora-blue-700/40 text-center">
                <p className="text-xs text-nora-gray-500 font-medium">
                    © 2025 Nora Control System. Todos los derechos reservados.
                </p>
            </footer>
        </div>
    );
}