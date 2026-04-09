'use server';

import { proveedorService } from '../services/proveedor.service';
import { Proveedor, ApiResponse } from '../types';
import { revalidatePath } from 'next/cache';

export async function getProveedoresAction(): Promise<ApiResponse<Proveedor[]>> {
    return await proveedorService.getAll();
}

export async function createProveedorAction(
    item: Omit<Proveedor, 'id' | 'created_at' | 'empresa_id'>
): Promise<ApiResponse<Proveedor>> {
    const response = await proveedorService.create(item);
    if (response.success) {
        revalidatePath('/dashboardMaster/proveedores');
        revalidatePath('/dashboardMaster/inventario');
    }
    return response;
}

export async function updateProveedorAction(
    id: string,
    item: Partial<Proveedor>
): Promise<ApiResponse<Proveedor>> {
    const response = await proveedorService.update(id, item);
    if (response.success) {
        revalidatePath('/dashboardMaster/proveedores');
        revalidatePath('/dashboardMaster/inventario');
    }
    return response;
}

export async function deleteProveedorAction(id: string): Promise<ApiResponse<null>> {
    const response = await proveedorService.delete(id);
    if (response.success) {
        revalidatePath('/dashboardMaster/proveedores');
        revalidatePath('/dashboardMaster/inventario');
    }
    return response;
}
