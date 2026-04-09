import { BaseService } from './base.service';
import { Proveedor, ApiResponse } from '../types';

export class ProveedorService extends BaseService {
    private table = 'proveedores';

    async getAll(): Promise<ApiResponse<Proveedor[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .order('nombre', { ascending: true });

            return this.handleResponse<Proveedor[]>(data, error);
        } catch (error) {
            return this.handleError<Proveedor[]>(error);
        }
    }

    async getById(id: string): Promise<ApiResponse<Proveedor>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('id', id)
                .maybeSingle();

            return this.handleResponse<Proveedor>(data, error);
        } catch (error) {
            return this.handleError<Proveedor>(error);
        }
    }

    async create(item: Omit<Proveedor, 'id' | 'created_at' | 'empresa_id'>): Promise<ApiResponse<Proveedor>> {
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

            return this.handleResponse<Proveedor>(data, error);
        } catch (error) {
            return this.handleError<Proveedor>(error);
        }
    }

    async update(id: string, item: Partial<Proveedor>): Promise<ApiResponse<Proveedor>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .update(item)
                .eq('id', id)
                .select()
                .maybeSingle();

            return this.handleResponse<Proveedor>(data, error);
        } catch (error) {
            return this.handleError<Proveedor>(error);
        }
    }

    async delete(id: string): Promise<ApiResponse<null>> {
        try {
            const supabase = await this.getSupabase();
            const { error } = await supabase
                .from(this.table)
                .delete()
                .eq('id', id);

            return this.handleResponse<null>(null, error);
        } catch (error) {
            return this.handleError<null>(error);
        }
    }
}

export const proveedorService = new ProveedorService();
