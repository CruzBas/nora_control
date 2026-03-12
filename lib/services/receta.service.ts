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
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.recetaTable)
                .update(receta)
                .eq('id', id)
                .select()
                .maybeSingle();

            return this.handleResponse<Receta>(data, error);
        } catch (error) {
            return this.handleError<Receta>(error);
        }
    }

    async delete(id: string): Promise<ApiResponse<null>> {
        try {
            const supabase = await this.getSupabase();
            const { error } = await supabase
                .from(this.recetaTable)
                .delete()
                .eq('id', id);

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

    /**
     * Devuelve solo las recetas que tienen al menos un ingrediente configurado.
     * Se usa en el POS para mostrar únicamente los productos listos para vender.
     */
    async getAllForPOS(): Promise<ApiResponse<Receta[]>> {
        try {
            const supabase = await this.getSupabase();

            // Inner join: solo recetas que aparecen en receta_producto
            const { data, error } = await supabase
                .from(this.recetaTable)
                .select(`
                    *,
                    receta_producto!inner(id)
                `)
                .order('nombre', { ascending: true });

            // Eliminar el campo receta_producto anidado innecesario del resultado
            const clean = data?.map(({ receta_producto: _, ...rest }) => rest) ?? null;

            return this.handleResponse<Receta[]>(clean as Receta[], error);
        } catch (error) {
            return this.handleError<Receta[]>(error);
        }
    }
}

export const recetaService = new RecetaService();
