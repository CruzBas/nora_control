import { BaseService } from './base.service';
import { Orden, OrdenItem, CierreCaja, ApiResponse, MetodoPago } from '../types';

export class OrdenService extends BaseService {
    private ordenTable = 'orden';
    private itemTable = 'orden_item';
    private cierreTable = 'cierre_caja';


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


    async getTerminadasHoy(): Promise<ApiResponse<Orden[]>> {
        try {
            const supabase = await this.getSupabase();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from(this.ordenTable)
                .select(`*, items:orden_item(*)`)
                .in('estado', ['lista', 'pagada'])
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false });

            return this.handleResponse<Orden[]>(data as Orden[], error);
        } catch (error) {
            return this.handleError<Orden[]>(error);
        }
    }


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


            const { data: { user } } = await supabase.auth.getUser();
            const usuarioId = user?.id ?? null;


            const recetaIds = [...new Set(items.map(i => i.receta_id))];
            const { data: recipeIngredients, error: riError } = await supabase
                .from('receta_producto')
                .select('receta_id, inventario_id, cantidad')
                .in('receta_id', recetaIds);

            if (riError) return this.handleError(riError);

            if (recipeIngredients && recipeIngredients.length > 0) {

                const totalRequired: Record<string, number> = {};
                for (const item of items) {
                    const ingredients = recipeIngredients.filter(ri => ri.receta_id === item.receta_id);
                    for (const ri of ingredients) {
                        const amount = Number(ri.cantidad) * item.cantidad;
                        totalRequired[ri.inventario_id] = (totalRequired[ri.inventario_id] || 0) + amount;
                    }
                }


                const invIds = Object.keys(totalRequired);
                const { data: currentStock, error: stockError } = await supabase
                    .from('inventario')
                    .select('id, producto, cantidad')
                    .in('id', invIds);

                if (stockError) return this.handleError(stockError);

                if (currentStock) {
                    for (const stockItem of currentStock) {
                        const needed = totalRequired[stockItem.id];
                        if (Number(stockItem.cantidad) < needed) {
                            return this.handleError(`Stock insuficiente de "${stockItem.producto}". Requerido: ${needed.toFixed(2)}, Disponible: ${Number(stockItem.cantidad).toFixed(2)}`);
                        }
                    }
                }
            }



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
                .maybeSingle();

            if (ordenError) console.error('create error in orden:', ordenError);

            if (ordenError || !orden) return this.handleResponse<Orden>(null, ordenError);


            const itemRows = items.map(i => ({ ...i, orden_id: orden.id }));
            const { error: itemsError } = await supabase.from(this.itemTable).insert(itemRows);
            if (itemsError) return this.handleResponse<Orden>(null, itemsError);

            return this.handleResponse<Orden>(orden as Orden, null);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }


    async updateEstado(id: string, estado: Orden['estado']): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .update({ estado })
                .eq('id', id)
                .select()
                .maybeSingle();

            if (error) console.error('updateEstado error in orden:', error);

            return this.handleResponse<Orden>(data as Orden, error);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }


    async getDashboardStats(): Promise<ApiResponse<{
        ventasHoy: number;
        ordenesActivas: number;
        ventasAyer: number;
    }>> {
        try {
            const supabase = await this.getSupabase();
            const hoy = new Date().toISOString().split('T')[0];
            const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            const [{ data: hoyData }, { data: ayerData }, { data: activas }] = await Promise.all([
                supabase.from(this.ordenTable).select('total').eq('estado', 'pagada')
                    .gte('created_at', `${hoy}T00:00:00`).lte('created_at', `${hoy}T23:59:59`),
                supabase.from(this.ordenTable).select('total').eq('estado', 'pagada')
                    .gte('created_at', `${ayer}T00:00:00`).lte('created_at', `${ayer}T23:59:59`),
                supabase.from(this.ordenTable).select('id').in('estado', ['pendiente', 'lista']),
            ]);

            const ventasHoy = (hoyData ?? []).reduce((s: number, o: { total: number }) => s + Number(o.total), 0);
            const ventasAyer = (ayerData ?? []).reduce((s: number, o: { total: number }) => s + Number(o.total), 0);
            return this.handleResponse({ ventasHoy, ordenesActivas: (activas ?? []).length, ventasAyer }, null);
        } catch (error) {
            return this.handleError(error);
        }
    }


    async getVentasSemana(dias = 7): Promise<ApiResponse<{ name: string; total: number }[]>> {
        try {
            const supabase = await this.getSupabase();
            const desde = new Date(Date.now() - (dias - 1) * 86400000).toISOString().split('T')[0];
            const { data, error } = await supabase
                .from(this.ordenTable).select('created_at, total')
                .eq('estado', 'pagada').gte('created_at', `${desde}T00:00:00`);

            if (error) return this.handleError(error);

            const map: Record<string, number> = {};
            for (let i = dias - 1; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000);
                map[d.toISOString().split('T')[0]] = 0;
            }
            for (const o of (data ?? []) as { created_at: string; total: number }[]) {
                const key = o.created_at.split('T')[0];
                if (key in map) map[key] += Number(o.total);
            }
            const result = Object.entries(map).map(([date, total]) => ({
                name: new Date(date + 'T12:00:00').toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric' }),
                total,
            }));
            return this.handleResponse(result, null);
        } catch (error) {
            return this.handleError(error);
        }
    }


    async getOrdenesRecientes(limite = 10): Promise<ApiResponse<Orden[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable).select('*')
                .order('created_at', { ascending: false }).limit(limite);
            return this.handleResponse<Orden[]>(data as Orden[], error);
        } catch (error) {
            return this.handleError<Orden[]>(error);
        }
    }


    async pagar(id: string, metodoPago: MetodoPago): Promise<ApiResponse<Orden>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.ordenTable)
                .update({ estado: 'pagada', metodo_pago: metodoPago })
                .eq('id', id)
                .select()
                .maybeSingle();

            if (error) console.error('pagar error in orden:', error);

            return this.handleResponse<Orden>(data as Orden, error);
        } catch (error) {
            return this.handleError<Orden>(error);
        }
    }


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


    async getCierresCaja(): Promise<ApiResponse<CierreCaja[]>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.cierreTable)
                .select(`
                    *,
                    usuario:usuario_id (
                        nombre,
                        apellido,
                        rol:rol_id (
                            nombre
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) return this.handleError(error);
            return this.handleResponse(data as CierreCaja[], null);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async saveCierre(data: Omit<CierreCaja, 'id' | 'created_at' | 'empresa_id'>): Promise<ApiResponse<CierreCaja>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data: { user } } = await supabase.auth.getUser();

            const { data: cierre, error } = await supabase
                .from(this.cierreTable)
                .insert({ 
                    ...data, 
                    empresa_id: empresaId,
                    usuario_id: user?.id || null 
                })
                .select()
                .maybeSingle();

            if (error) console.error('saveCierre error in orden:', error);

            return this.handleResponse<CierreCaja>(cierre as CierreCaja, error);
        } catch (error) {
            return this.handleError<CierreCaja>(error);
        }
    }


    async getReporteData(fechaInicio: string, fechaFin: string): Promise<ApiResponse<{
        kpis: { revenue: number, salesCount: number, avgTicket: number },
        topProducts: { name: string, quantity: number, revenue: number }[],
        chartData: { name: string, value: number }[]
    }>> {
        try {
            const supabase = await this.getSupabase();
            const { data: ordenes, error } = await supabase
                .from(this.ordenTable)
                .select('*, items:orden_item(*)')
                .eq('estado', 'pagada')
                .gte('created_at', `${fechaInicio}T00:00:00`)
                .lte('created_at', `${fechaFin}T23:59:59`)
                .order('created_at', { ascending: true });

            if (error) return this.handleError(error);

            const ords = (ordenes ?? []) as (Orden & { items?: OrdenItem[] })[];
            const salesCount = ords.length;
            const revenue = ords.reduce((sum, o) => sum + o.total, 0);
            const avgTicket = salesCount > 0 ? revenue / salesCount : 0;

            const productMap: Record<string, { quantity: number, revenue: number }> = {};
            const chartMap: Record<string, number> = {};

            for (const o of ords) {
                const dateKey = o.created_at.split('T')[0];
                chartMap[dateKey] = (chartMap[dateKey] || 0) + o.total;

                for (const item of (o.items ?? [])) {
                    const pname = item.nombre;
                    if (!productMap[pname]) {
                        productMap[pname] = { quantity: 0, revenue: 0 };
                    }
                    productMap[pname].quantity += item.cantidad;
                    productMap[pname].revenue += item.precio * item.cantidad;
                }
            }

            const topProducts = Object.entries(productMap)
                .map(([name, data]) => ({ name, quantity: data.quantity, revenue: data.revenue }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 10);

            const chartData = Object.entries(chartMap).map(([date, value]) => {
                const parts = date.split('-');
                const name = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
                return { name, value };
            });

            return this.handleResponse({
                kpis: { revenue, salesCount, avgTicket },
                topProducts,
                chartData
            }, null);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const ordenService = new OrdenService();
