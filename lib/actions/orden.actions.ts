'use server';

import { createClient } from '../supabase/server';
import { ApiResponse } from '../types';
import { revalidatePath } from 'next/cache';

export interface OrderItemDeduct {
    receta_id: string;

    quantity: number;
}

export async function completeOrderAndDeductInventoryAction(
    items: OrderItemDeduct[]
): Promise<ApiResponse<null>> {
    try {
        const supabase = await createClient();

        for (const item of items) {

            const { data: ingredientes, error: ingredientesError } = await supabase
                .from('receta_producto')
                .select('inventario_id, cantidad')
                .eq('receta_id', item.receta_id);

            if (ingredientesError) {
                console.error('[completeOrder] Error al obtener ingredientes:', ingredientesError);
                continue;
            }

            if (!ingredientes || ingredientes.length === 0) continue;


            for (const ingrediente of ingredientes) {
                const cantidadADescontar = ingrediente.cantidad * item.quantity;


                const { error: updateError } = await supabase.rpc('deduct_inventory', {
                    p_inventario_id: ingrediente.inventario_id,
                    p_cantidad: cantidadADescontar,
                });

                if (updateError) {
                    console.error('[completeOrder] Error al deducir inventario:', updateError.message);
                    

                    const { data: itemInv } = await supabase
                        .from('inventario')
                        .select('producto')
                        .eq('id', ingrediente.inventario_id)
                        .maybeSingle();
                    
                    throw new Error(`Inventario insuficiente para: ${itemInv?.producto || 'un ingrediente'}`);
                }
            }
        }

        revalidatePath('/dashboardAdmin/inventario');
        revalidatePath('/dashboardCocina');

        return { data: null, error: null, success: true };
    } catch (error) {
        console.error('[completeOrder] Excepción:', error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Error al completar la orden',
            success: false,
        };
    }
}
