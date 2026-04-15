'use server';

import { revalidatePath } from 'next/cache';
import { clienteFacturacionService } from '../services/cliente-facturacion.service';
import { ApiResponse, ClienteFacturacion } from '../types';

export async function getClientesFacturacionAction(): Promise<ApiResponse<ClienteFacturacion[]>> {
    return clienteFacturacionService.getAll();
}

export async function getClienteFacturacionByIdAction(id: string): Promise<ApiResponse<ClienteFacturacion>> {
    return clienteFacturacionService.getById(id);
}

export async function createClienteFacturacionAction(data: Partial<ClienteFacturacion>): Promise<ApiResponse<ClienteFacturacion>> {
    const response = await clienteFacturacionService.create(data);
    if (response.success) {
        revalidatePath('/dashboardMaster/factura/clientes');
        revalidatePath('/dashboardMaster/factura'); // For the modal dropdown if needed
    }
    return response;
}

export async function updateClienteFacturacionAction(id: string, data: Partial<ClienteFacturacion>): Promise<ApiResponse<ClienteFacturacion>> {
    const response = await clienteFacturacionService.update(id, data);
    if (response.success) {
        revalidatePath('/dashboardMaster/factura/clientes');
        revalidatePath('/dashboardMaster/factura');
    }
    return response;
}

export async function deleteClienteFacturacionAction(id: string): Promise<ApiResponse<boolean>> {
    const response = await clienteFacturacionService.delete(id);
    if (response.success) {
        revalidatePath('/dashboardMaster/factura/clientes');
        revalidatePath('/dashboardMaster/factura');
    }
    return response;
}
