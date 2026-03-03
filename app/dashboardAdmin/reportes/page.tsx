import ReportsHeader from '@/app/ui/reportes/ReportsHeader';
import ReportsDateFilter from '@/app/ui/reportes/ReportsDateFilter';
import ReportsKpis from '@/app/ui/reportes/ReportsKpis';
import ReportsTopProducts from '@/app/ui/reportes/ReportsTopProducts';
import ReportsRevenueChart from '@/app/ui/reportes/ReportsRevenueChart';

export default function ReportesPage() {
    return (
        <div className="flex flex-col min-h-full bg-nora-blue-900 text-nora-gray-100">
            <ReportsHeader title="Reportes Generales" />

            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
                <ReportsDateFilter />

                <ReportsKpis

                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ReportsTopProducts
                        products={[
                            { name: 'Combo Familiar', quantity: 45, revenue: '₡135,000.00' },
                            { name: 'Desayuno Nöra', quantity: 38, revenue: '₡76,000.00' },
                            { name: 'Café Especial', quantity: 72, revenue: '₡36,000.00' },
                        ]}
                    />
                    <ReportsRevenueChart title="Análisis de Ventas" />
                </div>
            </main>
        </div>
    );
}
