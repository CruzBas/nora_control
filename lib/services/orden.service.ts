import { createClient } from '../supabase/server';
import { BaseService } from './base.service';
import { Orden, DetalleOrden, CreateOrdenDto, CierreCaja, ApiResponse, MetodoPago } from '../types';

export class OrdenService extends BaseService {
    private ordenTable = 'orden';
    private detalleTable = 'detalle_orden';
    private cierreTable = 'cierre_caja';

    /** Todas las órdenes activas (no pagadas ni canceladas) de la empresa */
    async getActive(): Promise<ApiResponse<Orden[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .select(`*, detalles:detalle_orden(*, receta:receta_id(*))`)
                .in('estado', ['pendiente', 'en_preparacion', 'lista'])
                .order('created_at', { ascending: true });

            return this.handleResponse<Orden[]>(data as Orden[], error);
        } catch (error) {
            return this.handleError<Orden[]>(error);
        }
    }

    /** Órdenes pendientes/en preparación para la cocina */
    async getForKitchen(): Promise<ApiResponse<Orden[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .select(`*, detalles:detalle_orden(*, receta:receta_id(*))`)
                .in('estado', ['pendiente', 'en_preparacion'])
                .order('created_at', { ascending: true });

            return this.handleResponse<Orden[]>(data as Orden[], error);
        } catch (error) {
            return this.handleError<Orden[]>(error);
        }
    }

    /** Crear orden con sus detalles en una transacción */
    async create(dto: CreateOrdenDto): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const empresaId = await this.getEmpresaId();
            const { data: { user } } = await supabase.auth.getUser();

            const subtotal = dto.items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);
            const impuesto = parseFloat((subtotal * 0.13).toFixed(2));
            const total = parseFloat((subtotal + impuesto).toFixed(2));

            // 1. Crear la orden
            const { data: orden, error: ordenError } = await supabase
                .from(this.ordenTable)
                .insert({
                    empresa_id: empresaId,
                    usuario_id: user!.id,
                    cliente: dto.cliente || 'Cliente',
                    estado: 'pendiente',
                    subtotal,
                    impuesto,
                    total,
                })
                .select()
                .single();

            if (ordenError || !orden) return this.handleResponse<Orden>(null, ordenError);

            // 2. Insertar detalles
            const detalles = dto.items.map(item => ({
                orden_id: orden.id,
                receta_id: item.receta_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.precio_unitario * item.cantidad,
            }));

            const { error: detalleError } = await supabase
                .from(this.detalleTable)
                .insert(detalles);

            if (detalleError) return this.handleResponse<Orden>(null, detalleError);

            return this.handleResponse<Orden>(orden as Orden, null);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }

    /** Cocina marca como lista */
    async markAsReady(id: string): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .update({ estado: 'lista', completada_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            return this.handleResponse<Orden>(data as Orden, error);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }

    /** Cajero cobra y finaliza */
    async markAsPaid(id: string, metodo_pago: MetodoPago): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .update({
                    estado: 'pagada',
                    metodo_pago,
                    pagada_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            return this.handleResponse<Orden>(data as Orden, error);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }

    /** Cierre de caja: suma todo lo pagado hoy */
    async closeCash(): Promise<ApiResponse<CierreCaja>> {
        try {
            const supabase = await this.getSupabase();
            const empresaId = await this.getEmpresaId();
            const { data: { user } } = await supabase.auth.getUser();
            const today = new Date().toISOString().split('T')[0];

            // Buscar órdenes pagadas hoy
            const { data: ordenes } = await supabase
                .from(this.ordenTable)
                .select('total, metodo_pago')
                .eq('empresa_id', empresaId)
                .eq('estado', 'pagada')
                .gte('pagada_at', `${today}T00:00:00`)
                .lte('pagada_at', `${today}T23:59:59`);

            const totals = (ordenes ?? []).reduce(
                (acc, o) => {
                    acc.count++;
                    acc.general += Number(o.total);
                    if (o.metodo_pago === 'efectivo') acc.efectivo += Number(o.total);
                    else if (o.metodo_pago === 'tarjeta') acc.tarjeta += Number(o.total);
                    else if (o.metodo_pago === 'sinpe') acc.sinpe += Number(o.total);
                    else acc.otro += Number(o.total);
                    return acc;
                },
                { count: 0, general: 0, efectivo: 0, tarjeta: 0, sinpe: 0, otro: 0 }
            );

            const { data, error } = await supabase
                .from(this.cierreTable)
                .insert({
                    empresa_id: empresaId,
                    usuario_id: user!.id,
                    fecha: today,
                    total_efectivo: totals.efectivo,
                    total_tarjeta: totals.tarjeta,
                    total_sinpe: totals.sinpe,
                    total_otro: totals.otro,
                    total_general: totals.general,
                    ordenes_count: totals.count,
                })
                .select()
                .single();

            return this.handleResponse<CierreCaja>(data as CierreCaja, error);
        } catch (error) {
            return this.handleError<CierreCaja>(error);
        }
    }
}

export const ordenService = new OrdenService();
