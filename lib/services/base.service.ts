import { createClient } from '../supabase/server';
import { ApiResponse } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseService {
    protected async getSupabase(): Promise<SupabaseClient> {
        return await createClient();
    }

    protected async getEmpresaId(): Promise<string> {
        const supabase = await this.getSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('No estás autenticado.');
        }

        const { data: profile, error } = await supabase
            .from('usuario')
            .select('empresa_id')
            .eq('id', user.id)
            .single();

        if (error || !profile) {
            throw new Error('No se pudo encontrar el perfil de usuario o la empresa asociada.');
        }

        return profile.empresa_id;
    }

    protected handleResponse<T>(data: T | null, error: any): ApiResponse<T> {
        if (error) {
            console.error(`[Service Error]:`, error);
            return {
                data: null,
                error: error.message || 'Ocurrió un error inesperado',
                success: false,
            };
        }

        return {
            data,
            error: null,
            success: true,
        };
    }

    protected handleError<T>(error: any): ApiResponse<T> {
        console.error(`[Service Exception]:`, error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Excepción desconocida',
            success: false,
        };
    }
}
