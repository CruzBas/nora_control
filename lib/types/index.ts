

export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

// ── Organizacion & Empresa ────────────────────────────────────

export interface Organizacion extends BaseEntity {
    nombre: string;
    empresas?: Empresa[];
}

export interface Empresa extends BaseEntity {
    nombre: string;
    pais: string | null;
    ubicacion: string | null;
    organizacion_id: string | null;
    organizacion?: Organizacion | null;
}

export interface Proveedor extends BaseEntity {
    empresa_id: string;
    nombre: string;
    contacto?: string;
    email?: string;
}

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface Inventario extends BaseEntity {
    empresa_id?: string;
    producto: string;
    cantidad: number;
    unidad_medida: string;
    minimo: number;
    costo: number;
    proveedor_id?: string;
    cantidad_reorden?: number;
    proveedor?: Proveedor;
}

export interface Receta extends BaseEntity {
    empresa_id: string;
    nombre: string;
    precio: number;
    categoria: string;
    stock_disponible?: number;
}

export interface RecetaProducto extends BaseEntity {
    receta_id: string;
    inventario_id: string;
    cantidad: number;
    inventario?: Inventario;
}

// ── Órdenes ──────────────────────────────────────────────────

export type OrdenEstado = 'pendiente' | 'lista' | 'pagada' | 'cancelada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'sinpe' | 'otro';

export interface OrdenItem extends BaseEntity {
    orden_id: string;
    receta_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
}

export interface Orden extends BaseEntity {
    empresa_id: string;
    cliente_nombre: string;
    estado: OrdenEstado;
    metodo_pago: MetodoPago | null;
    observaciones: string | null;
    subtotal: number;
    impuesto: number;
    total: number;
    items?: OrdenItem[];
}

// ── Cierre de Caja ────────────────────────────────────────────

export interface CierreCaja extends BaseEntity {
    empresa_id: string;
    usuario_id?: string;
    fecha: string;
    total_efectivo: number;
    total_tarjeta: number;
    total_sinpe: number;
    total_otro: number;
    total_general: number;
    ordenes_count: number;
    usuario?: {
        nombre: string;
        apellido: string;
        rol?: { nombre: string } | null;
    } | null;
}
