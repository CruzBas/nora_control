'use server';

import { facturaElectronicaService } from '../services/factura-electronica.service';
import {
    ConfigFacturacion,
    FacturaElectronica,
    ApiResponse,
    TipoDocumentoFE,
    EstadoHacienda,
    ContribuyenteHacienda,
    CabysItem,
} from '../types';
import { revalidatePath } from 'next/cache';

// ─── Configuration ──────────────────────────────────────────────────

export async function getConfigFacturacionAction(): Promise<ApiResponse<ConfigFacturacion>> {
    return facturaElectronicaService.getConfig();
}

export async function saveConfigFacturacionAction(
    config: Partial<ConfigFacturacion>
): Promise<ApiResponse<ConfigFacturacion>> {
    const result = await facturaElectronicaService.saveConfig(config);
    if (result.success) {
        revalidatePath('/dashboardMaster/factura/config');
    }
    return result;
}

// ─── Emit Document ──────────────────────────────────────────────────

export async function emitirDocumentoAction(params: {
    orden_id?: string;
    tipo_documento: TipoDocumentoFE;
    receptor_nombre?: string;
    receptor_identificacion?: string;
    receptor_tipo_identificacion?: string;
    receptor_email?: string;
    items: { nombre: string; cantidad: number; precio: number; codigo_cabys?: string }[];
    subtotal: number;
    impuesto: number;
    total: number;
}): Promise<ApiResponse<FacturaElectronica>> {
    const result = await facturaElectronicaService.emitirDocumento(params);
    if (result.success) {
        revalidatePath('/dashboardMaster/factura');
        revalidatePath('/dashboardMaster/factura/historial');
    }
    return result;
}

// ─── List Documents ─────────────────────────────────────────────────

export async function getDocumentosFEAction(filtros?: {
    estado?: EstadoHacienda;
    tipo?: TipoDocumentoFE;
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
}): Promise<ApiResponse<FacturaElectronica[]>> {
    return facturaElectronicaService.getDocumentos(filtros);
}

export async function getDocumentoFEAction(id: string): Promise<ApiResponse<FacturaElectronica>> {
    return facturaElectronicaService.getDocumento(id);
}

export async function getDocumentoByOrdenAction(ordenId: string): Promise<ApiResponse<FacturaElectronica | null>> {
    return facturaElectronicaService.getDocumentoByOrden(ordenId);
}


// ─── Stats ──────────────────────────────────────────────────────────

export async function getStatsFEAction() {
    return facturaElectronicaService.getStats();
}

export async function consultarEstadoFEAction(facturaId?: string) {
    const result = await facturaElectronicaService.consultarEstado(facturaId);
    if (result.success) {
        revalidatePath('/dashboardMaster/factura');
    }
    return result;
}


// ─── Consultar Contribuyente (Hacienda API) ─────────────────────────

export async function consultarContribuyenteAction(
    identificacion: string
): Promise<ApiResponse<ContribuyenteHacienda>> {
    try {
        const cleanId = identificacion.replace(/\D/g, '');
        if (cleanId.length < 9 || cleanId.length > 12) {
            return {
                data: null,
                error: 'La identificación debe tener entre 9 y 12 dígitos numéricos.',
                success: false,
            };
        }

        const response = await fetch(
            `https://api.hacienda.go.cr/fe/ae?identificacion=${cleanId}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    data: null,
                    error: 'Contribuyente no encontrado.',
                    success: false,
                };
            }
            if (response.status === 429) {
                return {
                    data: null,
                    error: 'Límite de consultas excedido. Intente en unos minutos.',
                    success: false,
                };
            }
            return {
                data: null,
                error: `Error de Hacienda: ${response.status}`,
                success: false,
            };
        }

        const data = await response.json();
        return {
            data: data as ContribuyenteHacienda,
            error: null,
            success: true,
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Error al consultar contribuyente',
            success: false,
        };
    }
}


// ─── Consultar CABYS ────────────────────────────────────────────────

export async function consultarCabysAction(
    query: string
): Promise<ApiResponse<CabysItem[]>> {
    try {
        if (!query || query.length < 3) {
            return {
                data: null,
                error: 'La búsqueda debe tener al menos 3 caracteres.',
                success: false,
            };
        }

        const isCode = /^\d+$/.test(query);
        const url = isCode
            ? `https://api.hacienda.go.cr/fe/cabys?codigo=${query}`
            : `https://api.hacienda.go.cr/fe/cabys?q=${encodeURIComponent(query)}&top=10`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
            return {
                data: null,
                error: `Error al consultar CABYS: ${response.status}`,
                success: false,
            };
        }

        const data = await response.json();

        // CABYS returns { cabys: [...] }
        const items: CabysItem[] = (data.cabys || []).map((item: any) => ({
            codigo: item.codigo || '',
            descripcion: item.descripcion || '',
            impuesto: item.impuesto || 0,
            categorias: item.categorias || '',
        }));

        return {
            data: items,
            error: null,
            success: true,
        };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Error al consultar CABYS',
            success: false,
        };
    }
}
