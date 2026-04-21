

export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}


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
    codigo_cabys?: string;
    impuesto_cabys?: number;
}

export interface Receta extends BaseEntity {
    empresa_id: string;
    nombre: string;
    precio: number;
    categoria: string;
    stock_disponible?: number;
    codigo_cabys?: string;
    impuesto_cabys?: number;
}

export interface RecetaProducto extends BaseEntity {
    receta_id: string;
    inventario_id: string;
    cantidad: number;
    inventario?: Inventario;
}


export type OrdenEstado = 'pendiente' | 'lista' | 'pagada' | 'cancelada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'sinpe' | 'otro' | 'mixto';

export interface OrdenItem extends BaseEntity {
    orden_id: string;
    receta_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    requiere_cocina: boolean;
    notas?: string | null;
    extras?: { nombre: string, precio: number }[] | null;
}

export interface Orden extends BaseEntity {
    empresa_id: string;
    cliente_nombre: string;
    estado: OrdenEstado;
    metodo_pago: MetodoPago | null;
    observaciones: string | null;
    pagos?: Record<string, number> | null;
    tiempo_preparacion_minutos?: number | null;
    subtotal: number;
    impuesto: number;
    total: number;
    moneda?: 'CRC' | 'USD'; // Added for currency selection
    total_usd?: number; // Added for reference
    tipo_cambio?: number; // Added for reference
    items?: OrdenItem[];
}


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


// ─── Facturación Electrónica ────────────────────────────────────────────

export type TipoIdentificacion = '01' | '02' | '03' | '04'; // Física, Jurídica, DIMEX, NITE
export type TipoDocumentoFE = '01' | '02' | '03' | '04' | '08' | '09';
// 01=Factura, 02=ND, 03=NC, 04=Tiquete, 08=Compras, 09=Exportación
export type EstadoHacienda = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error';
export type AmbienteFE = 'sandbox' | 'produccion';

export interface ConfigFacturacion extends BaseEntity {
    empresa_id: string;
    cedula_emisor: string;
    tipo_identificacion_emisor: TipoIdentificacion;
    nombre_emisor: string;
    nombre_comercial?: string | null;
    codigo_actividad: string;
    provincia: string;
    canton: string;
    distrito: string;
    barrio?: string;
    otras_senas: string;
    telefono: string;
    email: string;
    ambiente: AmbienteFE;
    usuario_hacienda: string;
    password_hacienda: string;
    consecutivo_factura: number;
    consecutivo_tiquete: number;
    consecutivo_nota_credito: number;
    consecutivo_nota_debito: number;
    codigo_local: string;
    codigo_terminal: string;
    pin_p12?: string;
    archivo_p12?: string;
    logo_url?: string | null;
}

export interface FacturaElectronicaDetalle {
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    impuesto: number;
    total: number;
    codigo_cabys?: string;
}

export interface FacturaElectronica extends BaseEntity {
    empresa_id: string;
    orden_id?: string | null;
    clave: string;
    numero_consecutivo: string;
    tipo_documento: TipoDocumentoFE;
    fecha_emision: string;
    receptor_nombre?: string | null;
    receptor_identificacion?: string | null;
    receptor_tipo_identificacion?: string | null;
    receptor_email?: string | null;
    subtotal: number;
    impuesto: number;
    total: number;
    moneda: string;
    xml_enviado?: string | null;
    xml_respuesta?: string | null;
    estado_hacienda: EstadoHacienda;
    mensaje_hacienda?: string | null;
    detalle: FacturaElectronicaDetalle[];
}

export interface ClienteFacturacion extends BaseEntity {
    empresa_id: string;
    nombre: string;
    identificacion: string;
    tipo_identificacion: TipoIdentificacion;
    email?: string;
    telefono?: string;
}

export interface ContribuyenteHacienda {
    nombre: string;
    tipoIdentificacion: string;
    regimen: {
        codigo: string;
        descripcion: string;
    } | string;
    situacion: {
        estado: string;
        administracionTributaria?: string;
    };
    actividades: {
        codigo: string;
        descripcion: string;
    }[];
}

export interface CabysItem {
    codigo: string;
    descripcion: string;
    impuesto: number;
    categorias?: string;
}
