import MetricCard from '../MetricCard';

interface ReportsKpisProps {
    revenue?: string;
    salesCount?: string;
    avgTicket?: string;
    avgPrepTime?: string;
}

export default function ReportsKpis({
    revenue = '₡0.00',
    salesCount = '0',
    avgTicket = '₡0.00',
    avgPrepTime = '0 min',
}: ReportsKpisProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard
                title="Ingresos Totales"
                value={revenue}
                icon="payments"
                iconColorClass="text-nora-success"
                iconBgClass="bg-nora-success/10"
            />
            <MetricCard
                title="Ventas Realizadas"
                value={salesCount}
                icon="shopping_basket"
                iconColorClass="text-nora-accent-400"
                iconBgClass="bg-nora-accent-400/10"
            />
            <MetricCard
                title="Ticket Promedio"
                value={avgTicket}
                icon="receipt_long"
                iconColorClass="text-nora-info"
                iconBgClass="bg-nora-info/10"
            />
            <MetricCard
                title="Tiempo Cocina (Prom)"
                value={avgPrepTime}
                icon="timer"
                iconColorClass="text-yellow-400"
                iconBgClass="bg-yellow-400/10"
            />
        </div>
    );
}
