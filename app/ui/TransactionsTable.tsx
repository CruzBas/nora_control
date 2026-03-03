type TransactionStatus = 'completado' | 'pendiente' | 'cancelado';

interface Transaction {
    id: string;
    clientInitials: string;
    clientName: string;
    date: string;
    status: TransactionStatus;
    amount: string;
}

const STATUS_STYLES: Record<TransactionStatus, string> = {
    completado: 'bg-nora-success/15 text-nora-success',
    pendiente: 'bg-nora-warning/15 text-nora-warning',
    cancelado: 'bg-nora-danger/15 text-nora-danger',
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
    completado: 'Completado',
    pendiente: 'Pendiente',
    cancelado: 'Cancelado',
};

// Datos placeholder — se reemplazarán con datos del backend
const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        clientInitials: 'AM',
        clientName: 'Ana Martínez',
        date: 'Hace 2 horas',
        status: 'completado',
        amount: '$450.00',
    },
    {
        id: '2',
        clientInitials: 'CR',
        clientName: 'Carlos Rodríguez',
        date: 'Hace 5 horas',
        status: 'pendiente',
        amount: '$1,200.50',
    },
    {
        id: '3',
        clientInitials: 'LG',
        clientName: 'Laura García',
        date: 'Ayer, 18:30',
        status: 'completado',
        amount: '$85.20',
    },
];

interface TransactionsTableProps {
    transactions?: Transaction[];
}

export default function TransactionsTable({
    transactions = MOCK_TRANSACTIONS,
}: TransactionsTableProps) {
    return (
        <div className="bg-nora-blue-800/60 rounded-xl border border-nora-blue-700/40 shadow-[var(--nora-shadow-sm)] overflow-hidden">
            <div className="p-5 md:p-6 border-b border-nora-blue-700/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-lg font-bold text-nora-gray-100">
                    Transacciones Recientes
                </h4>
                <button className="text-sm font-bold text-nora-accent-400 hover:text-nora-accent-300 hover:underline transition-colors">
                    Ver todas
                </button>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-nora-blue-700/25">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-nora-gray-400 uppercase tracking-wider text-right">
                                Monto
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-nora-blue-700/30">
                        {transactions.map((tx) => (
                            <tr
                                key={tx.id}
                                className="hover:bg-nora-blue-700/20 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-nora-blue-600/50 flex items-center justify-center font-bold text-xs text-nora-gray-200">
                                            {tx.clientInitials}
                                        </div>
                                        <span className="text-sm font-semibold text-nora-gray-100">
                                            {tx.clientName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-nora-gray-400">
                                    {tx.date}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${STATUS_STYLES[tx.status]}`}
                                    >
                                        {STATUS_LABELS[tx.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-right text-nora-gray-100">
                                    {tx.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-nora-blue-700/30">
                {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-nora-blue-600/50 flex items-center justify-center font-bold text-xs text-nora-gray-200 shrink-0">
                                {tx.clientInitials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-nora-gray-100 truncate">
                                    {tx.clientName}
                                </p>
                                <p className="text-xs text-nora-gray-400">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-nora-gray-100">{tx.amount}</p>
                            <span
                                className={`text-[10px] font-bold ${STATUS_STYLES[tx.status]} px-2 py-0.5 rounded-full`}
                            >
                                {STATUS_LABELS[tx.status]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
