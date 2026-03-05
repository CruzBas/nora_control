import { createClient } from '../supabase/server';
import { BaseService } from './base.service';
import { Receta, RecetaProducto, ApiResponse } from '../types';

export class RecetaService extends BaseService {
    private recetaTable = 'receta';
    private recetaProductoTable = 'receta_producto';

    async getAll(): Promise<ApiResponse<Receta[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .select('*')
                .order('nombre', { ascending: true });

            return this.handleResponse<Receta[]>(data, error);
        } catch (error) {
            return this.handleError<Receta[]>(error);
        }
    }

    async getById(id: string): Promise<ApiResponse<Receta>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .select('*')
                .eq('id', id)
                .single();

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
                .single();

            return this.handleResponse<Receta>(data, error);
        } catch (error) {
            return this.handleError<Receta>(error);
        }
    }

    async addIngredient(ingredient: Omit<RecetaProducto, 'id' | 'created_at'>): Promise<ApiResponse<RecetaProducto>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaProductoTable)
                .insert(ingredient)
                .select()
                .single();

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
}

export const recetaService = new RecetaService();
