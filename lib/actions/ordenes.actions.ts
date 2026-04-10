'use server';

import { ordenService } from '../services/orden.service';
import { Orden, MetodoPago, ApiResponse, CierreCaja } from '../types';
import { revalidatePath } from 'next/cache';
import { completeOrderAndDeductInventoryAction, OrderItemDeduct } from './orden.actions';


export async function getOrdenesActivasAction(): Promise<ApiResponse<Orden[]>> {
    return ordenService.getActivas();
}


export async function getOrdenesTerminadasHoyAction(): Promise<ApiResponse<Orden[]>> {
    return ordenService.getTerminadasHoy();
}

export async function getPagadasHoyAction(): Promise<ApiResponse<Orden[]>> {
    return ordenService.getPagadasHoy();
}


export async function getDashboardStatsAction() {
    return ordenService.getDashboardStats();
}


export async function getVentasSemanaAction(dias = 7) {
    return ordenService.getVentasSemana(dias);
}


export async function getOrdenesRecientesAction(limite = 10) {
    return ordenService.getOrdenesRecientes(limite);
}


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


export async function marcarOrdenListaAction(ordenId: string, itemsParaDescontar: OrderItemDeduct[]): Promise<ApiResponse<Orden>> {

    if (itemsParaDescontar.length > 0) {
        await completeOrderAndDeductInventoryAction(itemsParaDescontar);
    }


    const response = await ordenService.updateEstado(ordenId, 'lista');
    if (response.success) {
        revalidatePath('/dashboardCocina');
        revalidatePath('/dashboardCajero');
        revalidatePath('/dashboardCajero/ventas');
    }
    return response;
}


export async function pagarOrdenAction(ordenId: string, metodoPago: MetodoPago, pagos?: Record<string, number>): Promise<ApiResponse<Orden>> {
    const response = await ordenService.pagar(ordenId, metodoPago, pagos);
    if (response.success) {
        revalidatePath('/dashboardCajero');
        revalidatePath('/dashboardCajero/ventas');
    }
    return response;
}


export async function getCierreCajaAction() {
    return ordenService.getCierreCaja();
}


export async function saveCierreCajaAction(
    data: Omit<CierreCaja, 'id' | 'created_at' | 'empresa_id' | 'usuario_id'>
): Promise<ApiResponse<CierreCaja>> {
    return ordenService.saveCierre(data);
}


export async function getReporteAction(fechaInicio: string, fechaFin: string) {
    return ordenService.getReporteData(fechaInicio, fechaFin);
}


export async function getCierresCajaAction() {
    return ordenService.getCierresCaja();
}
