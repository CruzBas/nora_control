import SidenavAdmin from "../ui/sidenavAdmin";

export default function DashboardAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">

            <SidenavAdmin />


            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                {children}
            </main>
        </div>
    );
}