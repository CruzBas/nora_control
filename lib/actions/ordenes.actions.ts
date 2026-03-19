'use server';

import { ordenService } from '../services/orden.service';
import { Orden, MetodoPago, ApiResponse, CierreCaja } from '../types';
import { revalidatePath } from 'next/cache';
import { completeOrderAndDeductInventoryAction, OrderItemDeduct } from './orden.actions';

/** Obtiene órdenes activas (pendiente + lista) */
export async function getOrdenesActivasAction(): Promise<ApiResponse<Orden[]>> {
    return ordenService.getActivas();
}

/** Órdenes terminadas hoy */
export async function getOrdenesTerminadasHoyAction(): Promise<ApiResponse<Orden[]>> {
    return ordenService.getTerminadasHoy();
}

/** Stats para el dashboard admin */
export async function getDashboardStatsAction() {
    return ordenService.getDashboardStats();
}

/** Ventas por día — últimos N días */
export async function getVentasSemanaAction(dias = 7) {
    return ordenService.getVentasSemana(dias);
}

/** Últimas N órdenes para tabla de transacciones */
export async function getOrdenesRecientesAction(limite = 10) {
    return ordenService.getOrdenesRecientes(limite);
}

/** Crea una nueva orden desde el POS */
export async function createOrdenAction(
    clienteNombre: string,
    items: { receta_id: string; nombre: string; precio: number; cantidad: number }[],
    observaciones?: string
): Promise<ApiResponse<Orden>> {
    const response = await ordenService.create(clienteNombre, items, observaciones);
    if (response.success) {
        revalidatePath('/dashboardCajero/ventas');
        revalidatePath('/dashboardCajero');
        revalidatePath('/dashboardCocina');
    }
    return response;
}

/** Cocina marca la orden como lista + descuenta inventario */
export async function marcarOrdenListaAction(ordenId: string, itemsParaDescontar: OrderItemDeduct[]): Promise<ApiResponse<Orden>> {
    // 1. Descontar inventario
    if (itemsParaDescontar.length > 0) {
        await completeOrderAndDeductInventoryAction(itemsParaDescontar);
    }

    // 2. Actualizar estado
    const response = await ordenService.updateEstado(ordenId, 'lista');
    if (response.success) {
        revalidatePath('/dashboardCocina');
        revalidatePath('/dashboardCajero');
        revalidatePath('/dashboardCajero/ventas');
    }
    return response;
}

/** Cajero cobra la orden: cambia estado a pagada y registra método de pago */
export async function pagarOrdenAction(ordenId: string, metodoPago: MetodoPago): Promise<ApiResponse<Orden>> {
    const response = await ordenService.pagar(ordenId, metodoPago);
    if (response.success) {
        revalidatePath('/dashboardCajero');
        revalidatePath('/dashboardCajero/ventas');
    }
    return response;
}

/** Datos para el cierre de caja del día */
export async function getCierreCajaAction() {
    return ordenService.getCierreCaja();
}

/** Guarda el registro del cierre de caja */
export async function saveCierreCajaAction(
    data: Omit<CierreCaja, 'id' | 'created_at' | 'empresa_id' | 'usuario_id'>
): Promise<ApiResponse<CierreCaja>> {
    return ordenService.saveCierre(data);
}

/** Obtiene el reporte de ventas por rango de fechas */
export async function getReporteAction(fechaInicio: string, fechaFin: string) {
    return ordenService.getReporteData(fechaInicio, fechaFin);
}

/** Obtiene todos los cierres de caja con su usuario */
export async function getCierresCajaAction() {
    return ordenService.getCierresCaja();
}
