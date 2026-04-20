import { createClient } from '../supabase/server';
import { BaseService } from './base.service';
import { Receta, RecetaProducto, ApiResponse } from '../types';

export class RecetaService extends BaseService {
    private recetaTable = 'receta';
    private recetaProductoTable = 'receta_producto';

    async getAll(): Promise<ApiResponse<Receta[]>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .select('*')
                .eq('empresa_id', empresaId)
                .order('nombre', { ascending: true });

            return this.handleResponse<Receta[]>(data, error);
        } catch (error) {
            return this.handleError<Receta[]>(error);
        }
    }

    async getById(id: string): Promise<ApiResponse<Receta>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .select('*')
                .eq('id', id)
                .eq('empresa_id', empresaId)
                .maybeSingle();

            return this.handleResponse<Receta>(data, error);
        } catch (error) {
            return this.handleError<Receta>(error);
        }
    }

    async getIngredients(recetaId: string): Promise<ApiResponse<RecetaProducto[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaProductoTable)
                .select(`
                    *,
                    inventario:inventario_id(*)
                `)
                .eq('receta_id', recetaId);

            return this.handleResponse<RecetaProducto[]>(data, error);
        } catch (error) {
            return this.handleError<RecetaProducto[]>(error);
        }
    }

    async create(receta: Omit<Receta, 'id' | 'created_at' | 'empresa_id'>): Promise<ApiResponse<Receta>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .insert({
                    ...receta,
                    empresa_id: empresaId
                })
                .select()
                .maybeSingle();

            return this.handleResponse<Receta>(data, error);
        } catch (error) {
            return this.handleError<Receta>(error);
        }
    }

    async update(id: string, receta: Partial<Omit<Receta, 'id' | 'created_at' | 'empresa_id'>>): Promise<ApiResponse<Receta>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .update(receta)
                .eq('id', id)
                .eq('empresa_id', empresaId)
                .select()
                .maybeSingle();

            return this.handleResponse<Receta>(data, error);
        } catch (error) {
            return this.handleError<Receta>(error);
        }
    }

    async delete(id: string): Promise<ApiResponse<null>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { error } = await supabase
                .from(this.recetaTable)
                .delete()
                .eq('id', id)
                .eq('empresa_id', empresaId);

            return this.handleResponse<null>(null, error);
        } catch (error) {
            return this.handleError<null>(error);
        }
    }

    async addIngredient(ingredient: Omit<RecetaProducto, 'id' | 'created_at'>): Promise<ApiResponse<RecetaProducto>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaProductoTable)
                .insert(ingredient)
                .select()
                .maybeSingle();

            return this.handleResponse<RecetaProducto>(data, error);
        } catch (error) {
            return this.handleError<RecetaProducto>(error);
        }
    }

    async removeIngredient(id: string): Promise<ApiResponse<null>> {
        try {
            const supabase = await createClient();
            const { error } = await supabase
                .from(this.recetaProductoTable)
                .delete()
                .eq('id', id);

            return this.handleResponse<null>(null, error);
        } catch (error) {
            return this.handleError<null>(error);
        }
    }


    async getAllForPOS(): Promise<ApiResponse<Receta[]>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();


            const { data, error } = await supabase
                .from(this.recetaTable)
                .select(`
                    *,
                    receta_producto!inner(
                        id,
                        cantidad,
                        inventario:inventario_id(id, cantidad)
                    )
                `)
                .eq('empresa_id', empresaId)
                .order('nombre', { ascending: true });

            if (error) return this.handleError(error);


            const recipesWithStock = (data || []).map((rec: any) => {
                let limitantStock = Infinity;
                

                const ingredients = rec.receta_producto || [];
                for (const item of ingredients) {
                    const currentStock = Number(item.inventario?.cantidad || 0);
                    const neededPerPortion = Number(item.cantidad || 1);
                    

                    const possiblePortions = neededPerPortion > 0 ? Math.floor(currentStock / neededPerPortion) : Infinity;
                    
                    if (possiblePortions < limitantStock) {
                        limitantStock = possiblePortions;
                    }
                }

                return {
                    ...rec,
                    stock_disponible: limitantStock === Infinity ? 0 : limitantStock,

                    receta_producto: undefined
                };
            });

            return this.handleResponse<Receta[]>(recipesWithStock as Receta[], null);
        } catch (error) {
            return this.handleError<Receta[]>(error);
        }
    }
}

export const recetaService = new RecetaService();
