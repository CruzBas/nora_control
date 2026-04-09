
export type Pagina =
    | 'home'
    | 'orden'
    | 'cocina'
    | 'facturas'
    | 'inventario'
    | 'reportes'
    | 'proveedores'
    | 'admin'
    | 'solicitudes'
    | 'cierres'
    | 'organizaciones';

export type RolNombre = 'Master' | 'Admin' | 'Cajero' | 'Cocina';


export const PERMISOS: Record<RolNombre, Record<Pagina, boolean | undefined>> = {
    Master: {
        home: true,
        orden: true,
        cocina: true,
        facturas: true,
        inventario: true,
        reportes: true,
        admin: true,
        proveedores: true,
        solicitudes: true,
        cierres: true,
        organizaciones: true,
    },
    Admin: {
        home: true,
        orden: true,
        cocina: true,
        facturas: true,
        inventario: true,
        reportes: true,
        admin: true,
        proveedores: true,
        solicitudes: true,
        cierres: true,
        organizaciones: true,
    },
    Cajero: {
        home: undefined,
        orden: true,
        cocina: false,
        facturas: true,
        inventario: true,
        reportes: false,
        admin: false,
        proveedores: false,
        solicitudes: undefined,
        cierres: false,
        organizaciones: undefined,
    },
    Cocina: {
        home: undefined,
        orden: false,
        cocina: true,
        facturas: false,
        inventario: true,
        reportes: false,
        proveedores: false,
        admin: false,
        solicitudes: undefined,
        cierres: false,
        organizaciones: undefined,
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
    '/dashboardMaster/organizaciones': 'organizaciones',
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
