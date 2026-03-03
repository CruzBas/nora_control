import SidenavCajero from "../ui/sidenavCajero";

export default function DashboardCajeroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-nora-blue-900">
            <SidenavCajero />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
