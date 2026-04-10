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
            .maybeSingle();

        if (error || !profile) {
            console.error('getEmpresaId error:', error || 'Profile not found');
            throw new Error(`No se pudo encontrar el perfil de usuario o la empresa asociada para el usuario ${user.id}.`);
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
        
        let errorMsg = 'Excepción desconocida';
        if (typeof error === 'string') {
            errorMsg = error;
        } else if (error instanceof Error) {
            errorMsg = error.message;
        } else if (error && typeof error === 'object' && error.message) {
            errorMsg = error.message; // Covers Supabase Error format
        } else if (error && typeof error === 'object') {
            try {
                errorMsg = JSON.stringify(error);
            } catch (e) {
                errorMsg = 'Error object could not be stringified';
            }
        }

        return {
            data: null,
            error: errorMsg,
            success: false,
        };
    }
}
