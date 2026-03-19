/**
 * Configuración centralizada de permisos por rol.
 * Define qué páginas puede acceder cada rol dentro del dashboard.
 */

export type Pagina =
    | 'home'
    | 'orden'
    | 'cocina'
    | 'facturas'
    | 'inventario'
    | 'reportes'
    | 'admin'
    | 'solicitudes'
    | 'cierres';

export type RolNombre = 'Master' | 'Admin' | 'Cajero' | 'Cocina';

/** Mapa de permisos: true = acceso, false = puede solicitar, undefined = oculto */
export const PERMISOS: Record<RolNombre, Record<Pagina, boolean | undefined>> = {
    Master: {
        home: true,
        orden: true,
        cocina: true,
        facturas: true,
        inventario: true,
        reportes: true,
        admin: true,
        solicitudes: true,
        cierres: true,
    },
    Admin: {
        home: true,
        orden: true,
        cocina: true,
        facturas: true,
        inventario: true,
        reportes: true,
        admin: true,
        solicitudes: true,
        cierres: true,
    },
    Cajero: {
        home: undefined,
        orden: true,
        cocina: false,
        facturas: true,
        inventario: true,
        reportes: false,
        admin: false,
        solicitudes: undefined,
        cierres: false,
    },
    Cocina: {
        home: undefined,
        orden: false,
        cocina: true,
        facturas: false,
        inventario: true,
        reportes: false,
        admin: false,
        solicitudes: undefined,
        cierres: false,
    },
};


export const RUTA_A_PAGINA: Record<string, Pagina> = {
    '/dashboardMaster': 'home',
    '/dashboardMaster/ventas': 'orden',
    '/dashboardMaster/cocina': 'cocina',
    '/dashboardMaster/facturas': 'facturas',
    '/dashboardMaster/inventario': 'inventario',
    '/dashboardMaster/reportes': 'reportes',
    '/dashboardMaster/admin': 'admin',
    '/dashboardMaster/solicitudes': 'solicitudes',
    '/dashboardMaster/cierres': 'cierres',
};


export function tieneAcceso(rol: string, pagina: Pagina): boolean | undefined {
    const rolKey = rol as RolNombre;
    if (!(rolKey in PERMISOS)) return true;
    return PERMISOS[rolKey][pagina];
}


export function rutaAPagina(pathname: string): Pagina | undefined {
    if (RUTA_A_PAGINA[pathname]) return RUTA_A_PAGINA[pathname];
    const rutas = Object.keys(RUTA_A_PAGINA).sort((a, b) => b.length - a.length);
    for (const ruta of rutas) {
        if (pathname.startsWith(ruta)) return RUTA_A_PAGINA[ruta];
    }
    return undefined;
}
