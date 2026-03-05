/**
 * Base types for the NORA CONTROL application.
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
}

export interface RecetaProducto extends BaseEntity {
    receta_id: string;
    inventario_id: string;
    cantidad: number;
    inventario?: Inventario;
}
