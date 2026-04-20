import { BaseService } from './base.service';
import { ApiResponse, Organizacion, Empresa } from '../types';

export class OrganizacionService extends BaseService {


    async getOrganizaciones(): Promise<ApiResponse<Organizacion[]>> {
        try {
            const orgId = await this.getOrganizacionId();
            if (!orgId) return this.handleResponse([], null);

            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('organizacion')
                .select('*, empresas:empresa(id, nombre, pais, ubicacion, organizacion_id, created_at)')
                .eq('id', orgId)
                .order('nombre', { ascending: true });

            return this.handleResponse(data as Organizacion[], error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async createOrganizacion(nombre: string): Promise<ApiResponse<Organizacion>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('organizacion')
                .insert({ nombre })
                .select()
                .maybeSingle();

            return this.handleResponse(data as Organizacion, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async updateOrganizacion(id: string, nombre: string): Promise<ApiResponse<Organizacion>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('organizacion')
                .update({ nombre })
                .eq('id', id)
                .select()
                .maybeSingle();

            return this.handleResponse(data as Organizacion, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async deleteOrganizacion(id: string): Promise<ApiResponse<null>> {
        try {
            const supabase = await this.getSupabase();
            const { error } = await supabase
                .from('organizacion')
                .delete()
                .eq('id', id);

            return this.handleResponse(null, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async getEmpresas(): Promise<ApiResponse<Empresa[]>> {
        try {
            const orgId = await this.getOrganizacionId();
            if (!orgId) return this.handleResponse([], null);

            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('empresa')
                .select('*, organizacion:organizacion_id(id, nombre)')
                .eq('organizacion_id', orgId)
                .order('nombre', { ascending: true });

            return this.handleResponse(data as Empresa[], error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async asignarEmpresaAOrganizacion(
        empresaId: string,
        organizacionId: string | null
    ): Promise<ApiResponse<Empresa>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('empresa')
                .update({ organizacion_id: organizacionId })
                .eq('id', empresaId)
                .select()
                .maybeSingle();

            return this.handleResponse(data as Empresa, error);
        } catch (error) {
            return this.handleError(error);
        }
    }


    async createEmpresa(
        nombre: string,
        organizacionId: string,
        pais?: string,
        ubicacion?: string
    ): Promise<ApiResponse<Empresa>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('empresa')
                .insert({
                    nombre,
                    organizacion_id: organizacionId,
                    pais: pais || null,
                    ubicacion: ubicacion || null,
                })
                .select()
                .maybeSingle();

            return this.handleResponse(data as Empresa, error);
        } catch (error) {
            return this.handleError(error);
        }
    }


    async updateEmpresa(
        id: string,
        fields: { nombre?: string; pais?: string | null; ubicacion?: string | null; organizacion_id?: string | null }
    ): Promise<ApiResponse<Empresa>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from('empresa')
                .update(fields)
                .eq('id', id)
                .select()
                .maybeSingle();

            return this.handleResponse(data as Empresa, error);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async verificarRolAdmin(): Promise<boolean> {
        try {
            const supabase = await this.getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data } = await supabase
                .from('usuario')
                .select('rol:rol_id(nombre)')
                .eq('id', user.id)
                .maybeSingle();

            const rolNombre = (data?.rol as any)?.nombre as string | undefined;
            return rolNombre === 'Master' || rolNombre === 'Admin';
        } catch {
            return false;
        }
    }
}

export const organizacionService = new OrganizacionService();
