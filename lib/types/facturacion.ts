
export type TipoDocumento = 'FE' | 'NC' | 'ND' | 'TE';
export type TipoCedula = 'fisico' | 'juridico' | 'extranjero';
export type CondicionVenta = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '99';
export type MedioPagoFE = '01' | '02' | '03' | '04' | '05' | '99';
export type MonedaFE = 'CRC' | 'USD';
export type EstadoHacienda = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error';
export type ModoFE = 'sandbox' | 'produccion';

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
    FE: 'Factura Electrónica',
    NC: 'Nota de Crédito',
    ND: 'Nota de Débito',
    TE: 'Tiquete Electrónico',
};

export const CONDICION_VENTA_LABELS: Record<string, string> = {
    '01': 'Contado',
    '02': 'Crédito',
    '03': 'Consignación',
    '04': 'Apartado',
    '05': 'Arrendamiento con opción de compra',
    '06': 'Arrendamiento en función financiera',
    '07': 'Cobro a favor de tercero',
    '08': 'Servicios prestados al Estado a crédito',
    '09': 'Pago del servicio prestado al Estado',
    '99': 'Otros',
};

export const MEDIO_PAGO_LABELS: Record<string, string> = {
    '01': 'Efectivo',
    '02': 'Tarjeta',
    '03': 'Cheque',
    '04': 'Transferencia / Depósito',
    '05': 'Recaudado por terceros',
    '99': 'Otros',
};

export const ESTADO_HACIENDA_CONFIG: Record<EstadoHacienda, { label: string; emoji: string; class: string }> = {
    pendiente: { label: 'Pendiente', emoji: '🟡', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    enviado: { label: 'Enviado', emoji: '🔵', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    aceptado: { label: 'Aceptado', emoji: '✅', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    rechazado: { label: 'Rechazado', emoji: '❌', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
    error: { label: 'Error', emoji: '⚠️', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
};

export const PROVINCIAS_CR: Record<string, string> = {
    '1': 'San José', '2': 'Alajuela', '3': 'Cartago', '4': 'Heredia',
    '5': 'Guanacaste', '6': 'Puntarenas', '7': 'Limón',
};

export const TIPO_CEDULA_LABELS: Record<TipoCedula, string> = {
    fisico: 'Persona Física',
    juridico: 'Persona Jurídica',
    extranjero: 'Extranjero',
};

export const TIPO_CEDULA_HACIENDA: Record<TipoCedula, string> = {
    fisico: '01',
    juridico: '02',
    extranjero: '03',
};


export interface ConfigFiscal {
    id: string;
    empresa_id: string;
    tipo_cedula: TipoCedula;
    cedula: string;
    nombre_comercial: string;
    codigo_actividad: string;
    provincia: string;
    canton: string;
    distrito: string;
    barrio: string;
    otras_senas: string;
    telefono: string;
    fax: string;
    email: string;
    sucursal: string;
    terminal: string;
    api_url: string;
    hacienda_username: string;
    hacienda_password: string;
    certificado_token: string;
    pin_certificado: string;
    modo: ModoFE;
    consecutivo_actual: number;
    created_at: string;
    updated_at: string;
}

export interface ClienteFiscal {
    id: string;
    empresa_id: string;
    nombre: string;
    tipo_cedula: TipoCedula;
    cedula: string;
    email: string;
    telefono: string;
    provincia: string;
    canton: string;
    distrito: string;
    otras_senas: string;
    created_at: string;
    updated_at: string;
}

export interface FacturaElectronica {
    id: string;
    empresa_id: string;
    orden_id: string | null;
    cliente_fiscal_id: string | null;
    tipo_documento: TipoDocumento;
    clave_hacienda: string;
    consecutivo: string;
    fecha_emision: string;
    condicion_venta: string;
    medio_pago: string;
    moneda: MonedaFE;
    tipo_cambio: number;
    subtotal: number;
    total_descuentos: number;
    total_impuestos: number;
    total_comprobante: number;
    total_serv_gravados: number;
    total_serv_exentos: number;
    total_merc_gravada: number;
    total_merc_exenta: number;
    total_gravados: number;
    total_exentos: number;
    total_ventas: number;
    total_ventas_neta: number;
    xml_sin_firmar: string;
    xml_firmado: string;
    estado_hacienda: EstadoHacienda;
    respuesta_hacienda: Record<string, unknown>;
    notas: string;
    factura_referencia_id: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    cliente_fiscal?: ClienteFiscal | null;
    detalles?: FacturaDetalle[];
}

export interface FacturaDetalle {
    id: string;
    factura_id: string;
    numero_linea: number;
    cantidad: number;
    unidad_medida: string;
    detalle: string;
    precio_unitario: number;
    monto_total: number;
    monto_descuento: number;
    naturaleza_descuento: string;
    subtotal: number;
    impuesto_codigo: string;
    impuesto_tarifa: number;
    impuesto_monto: number;
    monto_total_linea: number;
    created_at: string;
}

export interface EmitirFacturaRequest {
    orden_id: string;
    cliente_fiscal_id?: string;
    tipo_documento?: TipoDocumento;
    condicion_venta?: CondicionVenta;
    medio_pago?: MedioPagoFE;
    moneda?: MonedaFE;
    tipo_cambio?: number;
    notas?: string;
    // Quick client data (if no saved client)
    receptor_nombre?: string;
    receptor_tipo_cedula?: TipoCedula;
    receptor_cedula?: string;
    receptor_email?: string;
}

export interface CRLibreResponse {
    clave?: string;
    consecutivo?: string;
    xml?: string;
    xmlFirmado?: string;
    access_token?: string;
    refresh_token?: string;
    resp?: Record<string, unknown>;
    status?: number;
    text?: string;
    [key: string]: unknown;
}
