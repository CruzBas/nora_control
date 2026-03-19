'use client';

import { useUsuario } from '@/app/lib/useUsuario';
import HomeMaster from './HomeMaster';
import HomeCocina from './HomeCocina';
import HomeCajero from './HomeCajero';

export default function DashboardHomePage() {
    const { usuario, loading } = useUsuario();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-nora-blue-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nora-accent-500"></div>
            </div>
        );
    }

    const rol = usuario?.rol || 'Cajero';

    switch (rol) {
        case 'Cocina':
            return <HomeCocina />;
        case 'Cajero':
            return <HomeCajero />;
        case 'Master':
        case 'Admin':
        default:
            return <HomeMaster />;
    }
}