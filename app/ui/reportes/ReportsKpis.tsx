import MetricCard from '../MetricCard';

interface ReportsKpisProps {
    revenue?: string;
    salesCount?: string;
    avgTicket?: string;
}

export default function ReportsKpis({
    revenue = '₡120,000.00',
    salesCount = '42',
    avgTicket = '₡2,986.42',
}: ReportsKpisProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
    );
}
