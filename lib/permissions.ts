
export type Pagina =
    | 'home'
    | 'orden'
    | 'cocina'
    | 'inventario'
    | 'reportes'
    | 'proveedores'
    | 'admin'
    | 'solicitudes'
    | 'cierres'
    | 'organizaciones'
    | 'factura';

export type RolNombre = 'Master' | 'Admin' | 'Cajero' | 'Cocina';
export type SuscripcionNombre = 'Basico' | 'Pro' | 'Elite';
export type MotivoBloqueo = 'rol' | 'suscripcion' | 'inactivo';

export interface ResultadoAcceso {
    tiene: boolean | undefined;
    motivo?: MotivoBloqueo;
}


export const PERMISOS: Record<RolNombre, Record<Pagina, boolean | undefined>> = {
    Master: {
        home: true,
        orden: true,
        cocina: true,
        inventario: true,
        reportes: true,
        admin: true,
        proveedores: true,
        solicitudes: true,
        cierres: true,
        organizaciones: true,
        factura: true,
    },
    Admin: {
        home: true,
        orden: true,
        cocina: true,
        inventario: true,
        reportes: true,
        admin: true,
        proveedores: true,
        solicitudes: true,
        cierres: true,
        organizaciones: true,
        factura: true,
    },
    Cajero: {
        home: undefined,
        orden: true,
        cocina: false,
        inventario: true,
        reportes: false,
        admin: false,
        proveedores: false,
        solicitudes: undefined,
        cierres: false,
        organizaciones: undefined,
        factura: true,
    },
    Cocina: {
        home: undefined,
        orden: false,
        cocina: true,
        inventario: true,
        reportes: false,
        proveedores: false,
        admin: false,
        solicitudes: undefined,
        cierres: false,
        organizaciones: undefined,
        factura: false,
    },
};

export const PERMISOS_SUSCRIPCION: Record<SuscripcionNombre, Record<Pagina, boolean>> = {
    Basico: {
        home: true,
        orden: true,
        cocina: true,
        factura: true,
        inventario: false,
        reportes: false,
        proveedores: false,
        admin: false,
        solicitudes: false,
        cierres: false,
        organizaciones: false,
    },
    Pro: {
        home: true,
        orden: true,
        cocina: true,
        factura: true,
        inventario: true,
        reportes: true,
        cierres: true,
        proveedores: false,
        admin: false,
        solicitudes: false,
        organizaciones: false,
    },
    Elite: {
        home: true,
        orden: true,
        cocina: true,
        inventario: true,
        reportes: true,
        proveedores: true,
        admin: true,
        solicitudes: true,
        cierres: true,
        organizaciones: true,
        factura: true,
    },
};


export const RUTA_A_PAGINA: Record<string, Pagina> = {
    '/dashboardMaster': 'home',
    '/dashboardMaster/ventas': 'orden',
    '/dashboardMaster/cocina': 'cocina',
    '/dashboardMaster/inventario': 'inventario',
    '/dashboardMaster/reportes': 'reportes',
    '/dashboardMaster/admin': 'admin',
    '/dashboardMaster/solicitudes': 'solicitudes',
    '/dashboardMaster/cierres': 'cierres',
    '/dashboardMaster/organizaciones': 'organizaciones',
    '/dashboardMaster/factura': 'factura',
};


export function tieneAcceso(rol: string, pagina: Pagina, suscripcion?: string | null): ResultadoAcceso {
    // 1. Verificación por Suscripción (si se proporciona)
    if (suscripcion !== undefined) {
        if (!suscripcion) return { tiene: false, motivo: 'inactivo' }; // Sin suscripción = No hay acceso a nada

        const planKey = suscripcion as SuscripcionNombre;
        if (planKey in PERMISOS_SUSCRIPCION) {
            const tienePermisoPlan = PERMISOS_SUSCRIPCION[planKey][pagina];
            if (tienePermisoPlan === false) return { tiene: false, motivo: 'suscripcion' }; // El plan restringe esta página
        }
    }

    // 2. Verificación por Rol
    const rolKey = rol as RolNombre;
    if (!(rolKey in PERMISOS)) return { tiene: true };

    const permisoRol = PERMISOS[rolKey][pagina];
    return {
        tiene: permisoRol,
        motivo: permisoRol === false ? 'rol' : undefined
    };
}


export function rutaAPagina(pathname: string): Pagina | undefined {
    if (RUTA_A_PAGINA[pathname]) return RUTA_A_PAGINA[pathname];
    const rutas = Object.keys(RUTA_A_PAGINA).sort((a, b) => b.length - a.length);
    for (const ruta of rutas) {
        if (pathname.startsWith(ruta)) return RUTA_A_PAGINA[ruta];
    }
    return undefined;
}
