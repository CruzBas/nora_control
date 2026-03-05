'use server';

import { inventarioService } from '../services/inventario.service';
import { Inventario, ApiResponse } from '../types';
import { revalidatePath } from 'next/cache';

export async function getInventarioAction(): Promise<ApiResponse<Inventario[]>> {
    return await inventarioService.getAll();
}

export async function createInventarioAction(
    item: Omit<Inventario, 'id' | 'created_at' | 'empresa_id'>
): Promise<ApiResponse<Inventario>> {
    const response = await inventarioService.create(item);
    if (response.success) {
        revalidatePath('/dashboardAdmin/inventario');
    }
    return response;
}

export async function updateInventarioAction(
    id: string,
    item: Partial<Inventario>
): Promise<ApiResponse<Inventario>> {
    const response = await inventarioService.update(id, item);
    if (response.success) {
        revalidatePath('/dashboardAdmin/inventario');
    }
    return response;
}

export async function deleteInventarioAction(id: string): Promise<ApiResponse<null>> {
    const response = await inventarioService.delete(id);
    if (response.success) {
        revalidatePath('/dashboardAdmin/inventario');
    }
    return response;
}
