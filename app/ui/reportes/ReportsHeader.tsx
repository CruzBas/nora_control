interface ReportsHeaderProps {
    title: string;
}

export default function ReportsHeader({ title }: ReportsHeaderProps) {
    return (
        <header className="h-16 bg-nora-blue-800/80 backdrop-blur-md border-b border-nora-blue-700/50 flex items-center px-8 sticky top-0 z-10 transition-all duration-300">
            <h2 className="text-xl font-bold text-nora-gray-100 tracking-tight">
                {title}
            </h2>
        </header>
    );
}
