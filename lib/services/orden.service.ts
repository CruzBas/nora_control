import { BaseService } from './base.service';
import { Orden, OrdenItem, CierreCaja, ApiResponse, MetodoPago } from '../types';

export class OrdenService extends BaseService {
    private ordenTable = 'orden';
    private itemTable = 'orden_item';
    private cierreTable = 'cierre_caja';

    /** Trae órdenes activas (pendiente + lista) con sus ítems */
    async getActivas(): Promise<ApiResponse<Orden[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .select(`*, items:orden_item(*)`)
                .in('estado', ['pendiente', 'lista'])
                .order('created_at', { ascending: true });

            return this.handleResponse<Orden[]>(data as Orden[], error);
        } catch (error) {
            return this.handleError<Orden[]>(error);
        }
    }

    /** Crea una orden junto con todos sus ítems (transacción lógica) */
    async create(
        clienteNombre: string,
        items: { receta_id: string; nombre: string; precio: number; cantidad: number }[],
        observaciones?: string
    ): Promise<ApiResponse<Orden>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
            const impuesto = Math.round(subtotal * 0.13 * 100) / 100;
            const total = Math.round((subtotal + impuesto) * 100) / 100;

            // Obtener usuario autenticado (necesario por NOT NULL en usuario_id)
            const { data: { user } } = await supabase.auth.getUser();
            const usuarioId = user?.id ?? null;

            // 1. Insertar orden cabecera
            const { data: orden, error: ordenError } = await supabase
                .from(this.ordenTable)
                .insert({
                    empresa_id: empresaId,
                    usuario_id: usuarioId,
                    cliente: clienteNombre,
                    cliente_nombre: clienteNombre,
                    subtotal,
                    impuesto,
                    total,
                    observaciones: observaciones || null,
                    estado: 'pendiente',
                })
                .select()
                .single();

            if (ordenError || !orden) return this.handleResponse<Orden>(null, ordenError);

            // 2. Insertar ítems
            const itemRows = items.map(i => ({ ...i, orden_id: orden.id }));
            const { error: itemsError } = await supabase.from(this.itemTable).insert(itemRows);
            if (itemsError) return this.handleResponse<Orden>(null, itemsError);

            return this.handleResponse<Orden>(orden as Orden, null);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }

    /** Cambia el estado de una orden */
    async updateEstado(id: string, estado: Orden['estado']): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .update({ estado })
                .eq('id', id)
                .select()
                .single();

            return this.handleResponse<Orden>(data as Orden, error);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }

    /** Marca como pagada y registra el método de pago */
    async pagar(id: string, metodoPago: MetodoPago): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .update({ estado: 'pagada', metodo_pago: metodoPago })
                .eq('id', id)
                .select()
                .single();

            return this.handleResponse<Orden>(data as Orden, error);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }

    /** Cierre de caja: totales por método de pago de las órdenes pagadas hoy */
    async getCierreCaja(): Promise<ApiResponse<{
        total_efectivo: number; total_tarjeta: number;
        total_sinpe: number; total_otro: number;
        total_general: number; ordenes_count: number;
        ordenes: Orden[];
    }>> {
        try {
            const supabase = await this.getSupabase();
            const hoy = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from(this.ordenTable)
                .select('*')
                .eq('estado', 'pagada')
                .gte('created_at', `${hoy}T00:00:00`)
                .lte('created_at', `${hoy}T23:59:59`);

            if (error) return this.handleError(error);

            const ordenes = (data ?? []) as Orden[];
            const totals = {
                total_efectivo: 0, total_tarjeta: 0, total_sinpe: 0, total_otro: 0,
                total_general: 0, ordenes_count: ordenes.length, ordenes
            };

            for (const o of ordenes) {
                totals.total_general += o.total;
                if (o.metodo_pago === 'efectivo') totals.total_efectivo += o.total;
                else if (o.metodo_pago === 'tarjeta') totals.total_tarjeta += o.total;
                else if (o.metodo_pago === 'sinpe') totals.total_sinpe += o.total;
                else totals.total_otro += o.total;
            }

            return this.handleResponse(totals, null);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /** Guarda el registro de cierre de caja */
    async saveCierre(data: Omit<CierreCaja, 'id' | 'created_at' | 'empresa_id'>): Promise<ApiResponse<CierreCaja>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data: cierre, error } = await supabase
                .from(this.cierreTable)
                .insert({ ...data, empresa_id: empresaId })
                .select()
                .single();

            return this.handleResponse<CierreCaja>(cierre as CierreCaja, error);
        } catch (error) {
            return this.handleError<CierreCaja>(error);
        }
    }
}

export const ordenService = new OrdenService();
