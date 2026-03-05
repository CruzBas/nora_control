/**
 * Tipos para el sistema de órdenes completo.
 */

export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface Inventario extends BaseEntity {
    producto: string;
    cantidad: number;
    minimo: number;
    costo: number;
}

export interface Receta extends BaseEntity {
    empresa_id: string;
    nombre: string;
    precio: number;
    categoria: string;
}

export interface RecetaProducto extends BaseEntity {
    receta_id: string;
    inventario_id: string;
    cantidad: number;
    inventario?: Inventario;
}

export type OrdenEstado = 'pendiente' | 'en_preparacion' | 'lista' | 'pagada' | 'cancelada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'sinpe' | 'otro';

export interface DetalleOrden {
    id: string;
    orden_id: string;
    receta_id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    receta?: Receta;
}

export interface Orden extends BaseEntity {
    empresa_id: string;
    usuario_id: string;
    cliente: string | null;
    estado: OrdenEstado;
    subtotal: number;
    impuesto: number;
    total: number;
    metodo_pago: MetodoPago | null;
    completada_at: string | null;
    pagada_at: string | null;
    detalles?: DetalleOrden[];
}

export interface CreateOrdenDto {
    cliente: string;
    items: {
        receta_id: string;
        cantidad: number;
        precio_unitario: number;
    }[];
}

export interface CierreCaja extends BaseEntity {
    empresa_id: string;
    usuario_id: string;
    fecha: string;
    total_efectivo: number;
    total_tarjeta: number;
    total_sinpe: number;
    total_otro: number;
    total_general: number;
    ordenes_count: number;
    notas: string | null;
}
