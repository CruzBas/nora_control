import { BaseService } from './base.service';
import { ClienteFacturacion, ApiResponse } from '../types';

class ClienteFacturacionService extends BaseService {
    async getAll(): Promise<ApiResponse<ClienteFacturacion[]>> {
        try {
            const empresa_id = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { data, error } = await supabase
                .from('clientes_facturacion')
                .select('*')
                .eq('empresa_id', empresa_id)
                .order('nombre', { ascending: true });

            return this.handleResponse(data, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getById(id: string): Promise<ApiResponse<ClienteFacturacion>> {
        try {
            const empresa_id = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { data, error } = await supabase
                .from('clientes_facturacion')
                .select('*')
                .eq('id', id)
                .eq('empresa_id', empresa_id)
                .single();

            return this.handleResponse(data, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async create(cliente: Partial<ClienteFacturacion>): Promise<ApiResponse<ClienteFacturacion>> {
        try {
            const empresa_id = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { data, error } = await supabase
                .from('clientes_facturacion')
                .insert({
                    ...cliente,
                    empresa_id,
                })
                .select()
                .single();

            return this.handleResponse(data, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async update(id: string, cliente: Partial<ClienteFacturacion>): Promise<ApiResponse<ClienteFacturacion>> {
        try {
            const empresa_id = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { data, error } = await supabase
                .from('clientes_facturacion')
                .update({
                    ...cliente,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('empresa_id', empresa_id)
                .select()
                .single();

            return this.handleResponse(data, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async delete(id: string): Promise<ApiResponse<boolean>> {
        try {
            const empresa_id = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { error } = await supabase
                .from('clientes_facturacion')
                .delete()
                .eq('id', id)
                .eq('empresa_id', empresa_id);

            if (error) {
                return this.handleResponse(false, error);
            }

            return this.handleResponse(true, null);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const clienteFacturacionService = new ClienteFacturacionService();
