'use server';

import { recetaService } from '../services/receta.service';
import { Receta, RecetaProducto, ApiResponse } from '../types';
import { revalidatePath } from 'next/cache';

export async function getRecetasAction(): Promise<ApiResponse<Receta[]>> {
    return await recetaService.getAll();
}

export async function getRecetaIngredientsAction(recetaId: string): Promise<ApiResponse<RecetaProducto[]>> {
    return await recetaService.getIngredients(recetaId);
}

export async function createRecetaAction(
    receta: Omit<Receta, 'id' | 'created_at' | 'empresa_id'>
): Promise<ApiResponse<Receta>> {
    const response = await recetaService.create(receta);
    if (response.success) {
        revalidatePath('/dashboardAdmin/inventario');
    }
    return response;
}

export async function addIngredientToRecetaAction(
    ingredient: Omit<RecetaProducto, 'id' | 'created_at'>
): Promise<ApiResponse<RecetaProducto>> {
    const response = await recetaService.addIngredient(ingredient);
    if (response.success) {
        revalidatePath('/dashboardAdmin/inventario');
    }
    return response;
}

export async function removeIngredientFromRecetaAction(id: string): Promise<ApiResponse<null>> {
    const response = await recetaService.removeIngredient(id);
    if (response.success) {
        revalidatePath('/dashboardAdmin/inventario');
    }
    return response;
}
