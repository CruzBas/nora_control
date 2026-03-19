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
    | 'solicitudes';

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
    },
    Cajero: {
        home: undefined,
        orden: true,
        cocina: false,       // puede solicitar
        facturas: true,
        inventario: true,
        reportes: false,     // puede solicitar
        admin: false,        // puede solicitar
        solicitudes: undefined,    // puede solicitar
    },
    Cocina: {
        home: undefined,
        orden: false,        // puede solicitar
        cocina: true,
        facturas: false,     // puede solicitar
        inventario: true,
        reportes: false,     // puede solicitar
        admin: false,        // puede solicitar
        solicitudes: undefined,    // puede solicitar
    },
};

/** Mapeo de rutas a identificadores de página */
export const RUTA_A_PAGINA: Record<string, Pagina> = {
    '/dashboardMaster': 'home',
    '/dashboardMaster/ventas': 'orden',
    '/dashboardMaster/cocina': 'cocina',
    '/dashboardMaster/facturas': 'facturas',
    '/dashboardMaster/inventario': 'inventario',
    '/dashboardMaster/reportes': 'reportes',
    '/dashboardMaster/admin': 'admin',
    '/dashboardMaster/solicitudes': 'solicitudes',
};

/**
 * Verifica si un rol tiene acceso a una página.
 * Retorna true (acceso), false (puede solicitar), o undefined (oculto).
 */
export function tieneAcceso(rol: string, pagina: Pagina): boolean | undefined {
    const rolKey = rol as RolNombre;
    if (!(rolKey in PERMISOS)) return true; // Rol desconocido → acceso por defecto
    return PERMISOS[rolKey][pagina];
}

/**
 * Obtiene la página correspondiente a una ruta.
 */
export function rutaAPagina(pathname: string): Pagina | undefined {
    // Coincidencia exacta primero
    if (RUTA_A_PAGINA[pathname]) return RUTA_A_PAGINA[pathname];

    // Coincidencia parcial (para sub-rutas como /dashboardMaster/ventas/nueva)
    const rutas = Object.keys(RUTA_A_PAGINA).sort((a, b) => b.length - a.length);
    for (const ruta of rutas) {
        if (pathname.startsWith(ruta)) return RUTA_A_PAGINA[ruta];
    }
    return undefined;
}
