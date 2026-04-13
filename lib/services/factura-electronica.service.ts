import { BaseService } from './base.service';
import {
    ConfigFacturacion,
    FacturaElectronica,
    ApiResponse,
    TipoDocumentoFE,
    EstadoHacienda,
} from '../types';


export class FacturaElectronicaService extends BaseService {
    private configTable = 'config_facturacion';
    private facturaTable = 'factura_electronica';

    // ─── Configuration ──────────────────────────────────────────────────

    async getConfig(): Promise<ApiResponse<ConfigFacturacion>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.configTable)
                .select('*')
                .eq('empresa_id', empresaId)
                .maybeSingle();

            return this.handleResponse<ConfigFacturacion>(data as ConfigFacturacion, error);
        } catch (error) {
            return this.handleError<ConfigFacturacion>(error);
        }
    }

    async saveConfig(config: Partial<ConfigFacturacion>): Promise<ApiResponse<ConfigFacturacion>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            // Check if config exists
            const { data: existing } = await supabase
                .from(this.configTable)
                .select('id')
                .eq('empresa_id', empresaId)
                .maybeSingle();

            let result;
            if (existing) {
                const { data, error } = await supabase
                    .from(this.configTable)
                    .update({ ...config, updated_at: new Date().toISOString() })
                    .eq('empresa_id', empresaId)
                    .select()
                    .maybeSingle();
                result = { data, error };
            } else {
                const { data, error } = await supabase
                    .from(this.configTable)
                    .insert({ ...config, empresa_id: empresaId })
                    .select()
                    .maybeSingle();
                result = { data, error };
            }

            return this.handleResponse<ConfigFacturacion>(result.data as ConfigFacturacion, result.error);
        } catch (error) {
            return this.handleError<ConfigFacturacion>(error);
        }
    }

    // ─── Key Generation ─────────────────────────────────────────────────

    /**
     * Generate the 50-digit numeric key (clave numérica) for Costa Rica electronic invoicing.
     * Structure:
     *   01-03: Country code (506)
     *   04-05: Day (2 digits)
     *   06-07: Month (2 digits)
     *   08-09: Year (2 digits)
     *   10-21: Emitter ID (12 digits, zero-padded)
     *   22-41: Consecutive number (20 digits)
     *   42:    Situation (1=Normal)
     *   43-50: Security code (8 random digits)
     */
    generateClave(
        cedula: string,
        consecutivo: string,
        fecha: Date,
        situacion: string = '1'
    ): string {
        const pais = '506';
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = String(fecha.getFullYear()).slice(-2);
        const cedulaPad = cedula.replace(/\D/g, '').padStart(12, '0');
        const consecutivoPad = consecutivo.padStart(20, '0');
        const codigoSeguridad = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');

        return `${pais}${dia}${mes}${anio}${cedulaPad}${consecutivoPad}${situacion}${codigoSeguridad}`;
    }

    /**
     * Generate the 20-character consecutive number.
     * Structure:
     *   01-03: Local/branch code (e.g. '001')
     *   04-08: Terminal code (e.g. '00001')
     *   09-10: Document type ('01'=Factura, '04'=Tiquete, etc.)
     *   11-20: Sequential number (10 digits, zero-padded)
     */
    generateConsecutivo(
        codigoLocal: string,
        codigoTerminal: string,
        tipoDocumento: TipoDocumentoFE,
        numero: number
    ): string {
        const local = codigoLocal.padStart(3, '0');
        const terminal = codigoTerminal.padStart(5, '0');
        const seq = String(numero).padStart(10, '0');
        return `${local}${terminal}${tipoDocumento}${seq}`;
    }

    // ─── Increment Consecutive ──────────────────────────────────────────

    async incrementConsecutivo(tipoDocumento: TipoDocumentoFE): Promise<ApiResponse<number>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const columnMap: Record<string, string> = {
                '01': 'consecutivo_factura',
                '04': 'consecutivo_tiquete',
                '03': 'consecutivo_nota_credito',
                '02': 'consecutivo_nota_debito',
            };

            const column = columnMap[tipoDocumento] || 'consecutivo_factura';

            // Get current value
            const { data: config, error: getError } = await supabase
                .from(this.configTable)
                .select(column)
                .eq('empresa_id', empresaId)
                .single();

            if (getError || !config) return this.handleError(getError || 'Config not found');

            const currentVal = Number((config as unknown as Record<string, unknown>)[column]) || 0;
            const newVal = currentVal + 1;

            // Update
            const { error: updateError } = await supabase
                .from(this.configTable)
                .update({ [column]: newVal, updated_at: new Date().toISOString() })
                .eq('empresa_id', empresaId);

            if (updateError) return this.handleError(updateError);

            return this.handleResponse(newVal, null);
        } catch (error) {
            return this.handleError<number>(error);
        }
    }

    // ─── Emit Document ──────────────────────────────────────────────────

    async emitirDocumento(params: {
        orden_id?: string;
        tipo_documento: TipoDocumentoFE;
        receptor_nombre?: string;
        receptor_identificacion?: string;
        receptor_tipo_identificacion?: string;
        receptor_email?: string;
        items: { nombre: string; cantidad: number; precio: number; codigo_cabys?: string }[];
        subtotal: number;
        impuesto: number;
        total: number;
    }): Promise<ApiResponse<FacturaElectronica>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            // 1. Get config
            const { data: config, error: configError } = await supabase
                .from(this.configTable)
                .select('*')
                .eq('empresa_id', empresaId)
                .single();

            if (configError || !config) {
                return this.handleError('Debe configurar los datos de facturación electrónica primero.');
            }

            const cfg = config as ConfigFacturacion;

            // 2. Increment consecutive
            const consRes = await this.incrementConsecutivo(params.tipo_documento);
            if (!consRes.success || !consRes.data) {
                return this.handleError('Error al generar consecutivo: ' + consRes.error);
            }

            // 3. Generate consecutive number and clave
            const fecha = new Date();
            const consecutivo = this.generateConsecutivo(
                cfg.codigo_local,
                cfg.codigo_terminal,
                params.tipo_documento,
                consRes.data
            );
            const clave = this.generateClave(cfg.cedula_emisor, consecutivo, fecha);

            // 4. Build detail array
            const detalle = params.items.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.precio * item.cantidad,
                impuesto: item.precio * item.cantidad * 0.13,
                total: item.precio * item.cantidad * 1.13,
                codigo_cabys: item.codigo_cabys || '',
            }));

            // 5. Insert document
            const { data: factura, error: insertError } = await supabase
                .from(this.facturaTable)
                .insert({
                    empresa_id: empresaId,
                    orden_id: params.orden_id || null,
                    clave,
                    numero_consecutivo: consecutivo,
                    tipo_documento: params.tipo_documento,
                    fecha_emision: fecha.toISOString(),
                    receptor_nombre: params.receptor_nombre || null,
                    receptor_identificacion: params.receptor_identificacion || null,
                    receptor_tipo_identificacion: params.receptor_tipo_identificacion || null,
                    receptor_email: params.receptor_email || null,
                    subtotal: params.subtotal,
                    impuesto: params.impuesto,
                    total: params.total,
                    moneda: 'CRC',
                    estado_hacienda: 'pendiente',
                    detalle,
                })
                .select()
                .maybeSingle();

            if (insertError || !factura) {
                return this.handleResponse<FacturaElectronica>(null, insertError);
            }

            // 6. Build and sign the XML locally in Node.js
            const { buildXml, signXmlHacienda } = await import('./hacienda-xml.helper');
            
            const paramsXml = {
                tipo_documento: params.tipo_documento,
                clave,
                consecutivo,
                fecha: fecha.toISOString(),
                config: cfg,
                receptor: params.receptor_identificacion ? {
                    nombre: params.receptor_nombre,
                    identificacion: params.receptor_identificacion,
                    tipo_identificacion: params.receptor_tipo_identificacion,
                    email: params.receptor_email,
                } : null,
                detalle,
                subtotal: params.subtotal,
                impuesto: params.impuesto,
                total: params.total,
            };

            const xmlBruto = buildXml(paramsXml);
            let xmlToSubmitBase64 = Buffer.from(xmlBruto).toString('base64');

            if (cfg.archivo_p12 && cfg.pin_p12) {
                try {
                    xmlToSubmitBase64 = await signXmlHacienda(xmlBruto, cfg.archivo_p12, cfg.pin_p12);
                } catch (signErr: any) {
                    console.error("Error signing locally:", signErr.message);
                    return this.handleResponse<FacturaElectronica>(null, { 
                        message: `No se pudo firmar el XML con su certificado P12. Detalle: ${signErr.message}` 
                    } as any);
                }
            }

            // 7. Call Edge Function to send to Hacienda
            const { data: fnData, error: fnError } = await supabase.functions.invoke('emitir-factura', {
                body: {
                    factura_id: (factura as FacturaElectronica).id,
                    clave,
                    fecha: fecha.toISOString(),
                    tipo_documento: params.tipo_documento,
                    config: {
                        cedula_emisor: cfg.cedula_emisor,
                        tipo_identificacion_emisor: cfg.tipo_identificacion_emisor,
                        ambiente: cfg.ambiente,
                        usuario_hacienda: cfg.usuario_hacienda,
                        password_hacienda: cfg.password_hacienda,
                    },
                    xml_firmado_base64: xmlToSubmitBase64,
                },
            });

            // Update status based on edge function response
            if (fnError) {
                await supabase
                    .from(this.facturaTable)
                    .update({
                        estado_hacienda: 'error',
                        mensaje_hacienda: fnError.message || 'Error al enviar a Hacienda',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', (factura as FacturaElectronica).id);
            } else if (fnData) {
                await supabase
                    .from(this.facturaTable)
                    .update({
                        estado_hacienda: fnData.estado || 'enviado',
                        mensaje_hacienda: fnData.mensaje || (fnData.estado === 'error' ? 'Error al enviar a Hacienda' : 'Documento enviado a Hacienda'),
                        xml_enviado: fnData.xml_enviado || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', (factura as FacturaElectronica).id);
            }

            // Return the updated document
            const { data: updated } = await supabase
                .from(this.facturaTable)
                .select('*')
                .eq('id', (factura as FacturaElectronica).id)
                .single();

            return this.handleResponse<FacturaElectronica>(updated as FacturaElectronica, null);
        } catch (error) {
            return this.handleError<FacturaElectronica>(error);
        }
    }

    // ─── List Documents ─────────────────────────────────────────────────

    async getDocumentos(filtros?: {
        estado?: EstadoHacienda;
        tipo?: TipoDocumentoFE;
        fechaDesde?: string;
        fechaHasta?: string;
        limit?: number;
    }): Promise<ApiResponse<FacturaElectronica[]>> {
        try {
            const supabase = await this.getSupabase();
            let query = supabase
                .from(this.facturaTable)
                .select('*')
                .order('created_at', { ascending: false });

            if (filtros?.estado) query = query.eq('estado_hacienda', filtros.estado);
            if (filtros?.tipo) query = query.eq('tipo_documento', filtros.tipo);
            if (filtros?.fechaDesde) query = query.gte('fecha_emision', `${filtros.fechaDesde}T00:00:00`);
            if (filtros?.fechaHasta) query = query.lte('fecha_emision', `${filtros.fechaHasta}T23:59:59`);
            if (filtros?.limit) query = query.limit(filtros.limit);

            const { data, error } = await query;
            return this.handleResponse<FacturaElectronica[]>(data as FacturaElectronica[], error);
        } catch (error) {
            return this.handleError<FacturaElectronica[]>(error);
        }
    }

    async getDocumento(id: string): Promise<ApiResponse<FacturaElectronica>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.facturaTable)
                .select('*')
                .eq('id', id)
                .single();

            return this.handleResponse<FacturaElectronica>(data as FacturaElectronica, error);
        } catch (error) {
            return this.handleError<FacturaElectronica>(error);
        }
    }

    async getDocumentoByOrden(ordenId: string): Promise<ApiResponse<FacturaElectronica | null>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.facturaTable)
                .select('*')
                .eq('orden_id', ordenId)
                .order('created_at', { ascending: false })
                .maybeSingle();

            return this.handleResponse<FacturaElectronica | null>(data as FacturaElectronica | null, error);
        } catch (error) {
            return this.handleError<FacturaElectronica | null>(error);
        }
    }

    // ─── Stats ──────────────────────────────────────────────────────────

    async getStats(): Promise<ApiResponse<{
        total: number;
        aceptados: number;
        rechazados: number;
        pendientes: number;
    }>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.facturaTable)
                .select('estado_hacienda');

            if (error) return this.handleError(error);

            const docs = data || [];
            return this.handleResponse({
                total: docs.length,
                aceptados: docs.filter(d => d.estado_hacienda === 'aceptado').length,
                rechazados: docs.filter(d => d.estado_hacienda === 'rechazado').length,
                pendientes: docs.filter(d => d.estado_hacienda === 'pendiente' || d.estado_hacienda === 'enviado').length,
            }, null);
        } catch (error) {
            return this.handleError(error);
        }
    }
    // ─── Consult Status ────────────────────────────────────────────────

    async consultarEstado(facturaId?: string): Promise<ApiResponse<any>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase.functions.invoke('consultar-estado', {
                body: { factura_id: facturaId },
            });

            return this.handleResponse(data, error);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export const facturaElectronicaService = new FacturaElectronicaService();
