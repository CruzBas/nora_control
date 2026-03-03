import { ReactNode } from 'react';

type MetricTrend = 'up' | 'down' | 'neutral';

interface MetricCardProps {
    title: string;
    value: string;
    icon: string;
    iconColorClass?: string;
    iconBgClass?: string;
    badge?: string;
    badgeColorClass?: string;
    trend?: MetricTrend;
    accentBorder?: boolean;
    accentBorderClass?: string;
}

export default function MetricCard({
    title,
    value,
    icon,
    iconColorClass = 'text-nora-accent-400',
    iconBgClass = 'bg-nora-accent-500/10',
    badge,
    badgeColorClass = 'text-nora-success bg-nora-success/10',
    accentBorder = false,
    accentBorderClass = 'border-l-nora-danger',
}: MetricCardProps) {
    return (
        <div
            className={`
                bg-nora-blue-800/60 p-5 md:p-6 rounded-xl
                border border-nora-blue-700/40
                shadow-[var(--nora-shadow-sm)]
                hover:border-nora-blue-600/50 transition-all duration-200
                ${accentBorder ? `border-l-4 ${accentBorderClass}` : ''}
            `}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${iconBgClass} rounded-lg`}>
                    <span className={`material-symbols-outlined ${iconColorClass} text-[22px]`}>
                        {icon}
                    </span>
                </div>
                {badge && (
                    <span className={`text-[10px] font-bold ${badgeColorClass} px-2 py-1 rounded-md`}>
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-nora-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1 text-nora-gray-100">{value}</p>
        </div>
    );
}
