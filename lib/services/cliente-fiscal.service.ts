import { BaseService } from './base.service';
import { ApiResponse } from '../types';
import { ClienteFiscal } from '../types/facturacion';

export class ClienteFiscalService extends BaseService {
    private table = 'cliente_fiscal';

    async getAll(): Promise<ApiResponse<ClienteFiscal[]>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('empresa_id', empresaId)
                .order('nombre', { ascending: true });

            return this.handleResponse<ClienteFiscal[]>(data as ClienteFiscal[], error);
        } catch (error) {
            return this.handleError<ClienteFiscal[]>(error);
        }
    }

    async create(cliente: Partial<ClienteFiscal>): Promise<ApiResponse<ClienteFiscal>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .insert({ ...cliente, empresa_id: empresaId })
                .select()
                .maybeSingle();

            return this.handleResponse<ClienteFiscal>(data as ClienteFiscal, error);
        } catch (error) {
            return this.handleError<ClienteFiscal>(error);
        }
    }

    async update(id: string, updates: Partial<ClienteFiscal>): Promise<ApiResponse<ClienteFiscal>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.table)
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .maybeSingle();

            return this.handleResponse<ClienteFiscal>(data as ClienteFiscal, error);
        } catch (error) {
            return this.handleError<ClienteFiscal>(error);
        }
    }

    async remove(id: string): Promise<ApiResponse<null>> {
        try {
            const supabase = await this.getSupabase();
            const { error } = await supabase.from(this.table).delete().eq('id', id);
            return this.handleResponse<null>(null, error);
        } catch (error) {
            return this.handleError<null>(error);
        }
    }
}

export const clienteFiscalService = new ClienteFiscalService();
