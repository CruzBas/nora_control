import SidenavCocina from "../ui/sidenavCocina";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-nora-blue-900">
            <SidenavCocina />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}