
import SidenavMaster from "../ui/sidenavMaster";
import RouteGuard from "../ui/RouteGuard";

export default function DashboardAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">

            <SidenavMaster />


            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <RouteGuard>
                    {children}
                </RouteGuard>
            </main>
        </div>
    );
}