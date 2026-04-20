import { createClient } from '../supabase/server';
import { BaseService } from './base.service';
import { Inventario, ApiResponse } from '../types';

export class InventarioService extends BaseService {
    private table = 'inventario';

    async getAll(): Promise<ApiResponse<Inventario[]>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .select('*, proveedor:proveedores(*)')
                .eq('empresa_id', empresaId)
                .order('producto', { ascending: true });

            return this.handleResponse<Inventario[]>(data, error);
        } catch (error) {
            return this.handleError<Inventario[]>(error);
        }
    }

    async getById(id: string): Promise<ApiResponse<Inventario>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .select('*, proveedor:proveedores(*)')
                .eq('id', id)
                .eq('empresa_id', empresaId)
                .maybeSingle();

            return this.handleResponse<Inventario>(data, error);
        } catch (error) {
            return this.handleError<Inventario>(error);
        }
    }

    async create(item: Omit<Inventario, 'id' | 'created_at' | 'empresa_id'>): Promise<ApiResponse<Inventario>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { data, error } = await supabase
                .from(this.table)
                .insert({
                    ...item,
                    empresa_id: empresaId
                })
                .select()
                .maybeSingle();

            return this.handleResponse<Inventario>(data, error);
        } catch (error) {
            return this.handleError<Inventario>(error);
        }
    }

    async update(id: string, item: Partial<Inventario>): Promise<ApiResponse<Inventario>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await createClient();
            const { data, error } = await supabase
                .from(this.table)
                .update(item)
                .eq('id', id)
                .eq('empresa_id', empresaId)
                .select()
                .maybeSingle();

            return this.handleResponse<Inventario>(data, error);
        } catch (error) {
            return this.handleError<Inventario>(error);
        }
    }

    async delete(id: string): Promise<ApiResponse<null>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await createClient();
            const { error } = await supabase
                .from(this.table)
                .delete()
                .eq('id', id)
                .eq('empresa_id', empresaId);

            return this.handleResponse<null>(null, error);
        } catch (error) {
            return this.handleError<null>(error);
        }
    }
}

export const inventarioService = new InventarioService();
