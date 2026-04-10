import { BaseService } from './base.service';
import { ApiResponse } from '../types';
import {
    ConfigFiscal,
    FacturaElectronica,
    FacturaDetalle,
    ClienteFiscal,
    TipoDocumento,
    TIPO_CEDULA_HACIENDA,
    CRLibreResponse,
    EmitirFacturaRequest,
} from '../types/facturacion';

export class HaciendaService extends BaseService {
    private configTable = 'empresa_config_fiscal';
    private facturaTable = 'factura_electronica';
    private detalleTable = 'factura_detalle';
    private clienteTable = 'cliente_fiscal';




    async getConfig(): Promise<ApiResponse<ConfigFiscal>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.configTable)
                .select('*')
                .eq('empresa_id', empresaId)
                .maybeSingle();

            return this.handleResponse<ConfigFiscal>(data as ConfigFiscal, error);
        } catch (error) {
            return this.handleError<ConfigFiscal>(error);
        }
    }

    async upsertConfig(config: Partial<ConfigFiscal>): Promise<ApiResponse<ConfigFiscal>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();

            const { data: existing } = await supabase
                .from(this.configTable)
                .select('id')
                .eq('empresa_id', empresaId)
                .maybeSingle();

            let result;
            if (existing) {
                result = await supabase
                    .from(this.configTable)
                    .update({ ...config, updated_at: new Date().toISOString() })
                    .eq('id', existing.id)
                    .select()
                    .maybeSingle();
            } else {
                result = await supabase
                    .from(this.configTable)
                    .insert({ ...config, empresa_id: empresaId })
                    .select()
                    .maybeSingle();
            }

            return this.handleResponse<ConfigFiscal>(result.data as ConfigFiscal, result.error);
        } catch (error) {
            return this.handleError<ConfigFiscal>(error);
        }
    }




    private async callAPI(apiUrl: string, params: Record<string, string>): Promise<CRLibreResponse> {
        const body = new URLSearchParams(params).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        return await response.json();
    }


    async obtenerToken(config: ConfigFiscal): Promise<CRLibreResponse> {
        const clientId = config.modo === 'produccion' ? 'api-prod' : 'api-stag';
        return this.callAPI(config.api_url, {
            w: 'token',
            r: 'gettoken',
            grant_type: 'password',
            client_id: clientId,
            username: config.hacienda_username,
            password: config.hacienda_password,
        });
    }


    async generarClave(
        config: ConfigFiscal,
        tipoDocumento: TipoDocumento,
        consecutivoNum: number
    ): Promise<CRLibreResponse> {
        const consecutivoStr = consecutivoNum.toString().padStart(10, '0');
        const codigoSeguridad = Math.floor(10000000 + Math.random() * 90000000).toString();

        return this.callAPI(config.api_url, {
            w: 'clave',
            r: 'clave',
            tipoCedula: config.tipo_cedula,
            cedula: config.cedula,
            situacion: 'normal',
            codigoPais: '506',
            consecutivo: consecutivoStr,
            codigoSeguridad,
            tipoDocumento,
            terminal: config.terminal,
            sucursal: config.sucursal,
        });
    }


    async generarXML(
        config: ConfigFiscal,
        clave: string,
        consecutivo: string,
        fechaEmision: string,
        receptor: { nombre: string; tipoCedula: string; cedula: string; email: string; provincia?: string; canton?: string; distrito?: string },
        detallesJson: string,
        totales: {
            totalServGravados: number; totalServExentos: number;
            totalMercGravada: number; totalMercExenta: number;
            totalGravados: number; totalExentos: number;
            totalVentas: number; totalDescuentos: number;
            totalVentasNeta: number; totalImpuestos: number;
            totalComprobante: number;
        },
        condicionVenta: string,
        medioPago: string,
        moneda: string,
        tipoCambio: number,
        otros: string
    ): Promise<CRLibreResponse> {
        return this.callAPI(config.api_url, {
            w: 'genXML',
            r: 'gen_xml_fe',
            clave,
            codigo_actividad_emisor: config.codigo_actividad,
            consecutivo,
            fecha_emision: fechaEmision,
            emisor_nombre: config.nombre_comercial,
            emisor_tipo_identif: TIPO_CEDULA_HACIENDA[config.tipo_cedula],
            emisor_num_identif: config.cedula,
            emisor_nombre_comercial: config.nombre_comercial,
            emisor_provincia: config.provincia,
            emisor_canton: config.canton,
            emisor_distrito: config.distrito,
            emisor_barrio: config.barrio,
            emisor_otras_senas: config.otras_senas,
            emisor_cod_pais_tel: '506',
            emisor_tel: config.telefono,
            emisor_cod_pais_fax: '506',
            emisor_fax: config.fax,
            emisor_email: config.email,
            receptor_nombre: receptor.nombre,
            receptor_tipo_identif: receptor.tipoCedula,
            receptor_num_identif: receptor.cedula,
            receptor_provincia: receptor.provincia || config.provincia,
            receptor_canton: receptor.canton || config.canton,
            receptor_distrito: receptor.distrito || config.distrito,
            receptor_barrio: '01',
            receptor_cod_pais_tel: '506',
            receptor_tel: '00000000',
            receptor_cod_pais_fax: '506',
            receptor_fax: '00000000',
            receptor_email: receptor.email,
            condicion_venta: condicionVenta,
            plazo_credito: '0',
            medios_pago: medioPago,
            cod_moneda: moneda,
            tipo_cambio: tipoCambio.toString(),
            total_serv_gravados: totales.totalServGravados.toString(),
            total_serv_exentos: totales.totalServExentos.toString(),
            total_merc_gravada: totales.totalMercGravada.toString(),
            total_merc_exenta: totales.totalMercExenta.toString(),
            total_gravados: totales.totalGravados.toString(),
            total_exento: totales.totalExentos.toString(),
            total_ventas: totales.totalVentas.toString(),
            total_descuentos: totales.totalDescuentos.toString(),
            total_ventas_neta: totales.totalVentasNeta.toString(),
            total_impuestos: totales.totalImpuestos.toString(),
            total_comprobante: totales.totalComprobante.toString(),
            otros,
            detalles: detallesJson,
        });
    }


    async firmarXML(config: ConfigFiscal, xmlBase64: string): Promise<CRLibreResponse> {
        return this.callAPI(config.api_url, {
            w: 'firmarXML',
            r: 'firmar',
            p12Url: config.certificado_token,
            inXml: xmlBase64,
            pinP12: config.pin_certificado,
        });
    }


    async enviarHacienda(
        config: ConfigFiscal,
        token: string,
        clave: string,
        fecha: string,
        emisorTipo: string,
        emisorCedula: string,
        receptorTipo: string,
        receptorCedula: string,
        xmlFirmado: string,
    ): Promise<CRLibreResponse> {
        const clientId = config.modo === 'produccion' ? 'api-prod' : 'api-stag';
        return this.callAPI(config.api_url, {
            w: 'send',
            r: 'json',
            token,
            clave,
            fecha,
            emi_tipoIdentificacion: emisorTipo,
            emi_numeroIdentificacion: emisorCedula,
            recp_tipoIdentificacion: receptorTipo,
            recp_numeroIdentificacion: receptorCedula,
            comprobanteXml: xmlFirmado,
            client_id: clientId,
        });
    }




    async procesarFactura(request: EmitirFacturaRequest): Promise<ApiResponse<FacturaElectronica>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();


            const { data: config } = await this.getConfig();
            if (!config || !config.cedula) {
                return this.handleError('Configuración fiscal no encontrada. Configure primero los datos fiscales de la empresa.');
            }


            const { data: orden, error: ordenError } = await supabase
                .from('orden')
                .select('*, items:orden_item(*)')
                .eq('id', request.orden_id)
                .maybeSingle();

            if (ordenError || !orden) {
                return this.handleError('Orden no encontrada.');
            }


            let receptor = {
                nombre: request.receptor_nombre || 'Cliente General',
                tipoCedula: TIPO_CEDULA_HACIENDA[request.receptor_tipo_cedula || 'fisico'],
                cedula: request.receptor_cedula || '000000000',
                email: request.receptor_email || config.email,
                provincia: '',
                canton: '',
                distrito: '',
            };

            if (request.cliente_fiscal_id) {
                const { data: cliente } = await supabase
                    .from(this.clienteTable)
                    .select('*')
                    .eq('id', request.cliente_fiscal_id)
                    .maybeSingle();

                if (cliente) {
                    receptor = {
                        nombre: cliente.nombre,
                        tipoCedula: TIPO_CEDULA_HACIENDA[cliente.tipo_cedula as keyof typeof TIPO_CEDULA_HACIENDA],
                        cedula: cliente.cedula,
                        email: cliente.email || config.email,
                        provincia: cliente.provincia,
                        canton: cliente.canton,
                        distrito: cliente.distrito,
                    };
                }
            }


            const nuevoConsecutivo = (config.consecutivo_actual || 0) + 1;
            await supabase
                .from(this.configTable)
                .update({ consecutivo_actual: nuevoConsecutivo })
                .eq('id', config.id);


            const tipoDoc = request.tipo_documento || 'FE';
            const claveResp = await this.generarClave(config, tipoDoc, nuevoConsecutivo);
            if (!claveResp.clave) {
                return this.handleError('Error al generar clave: ' + JSON.stringify(claveResp));
            }


            const items = (orden.items || []) as Array<{
                nombre: string; cantidad: number; precio: number;
            }>;

            const detallesObj: Record<string, Record<string, string | Record<string, Record<string, string>>>> = {};
            let totalImpuestos = 0;
            let totalVentasNeta = 0;

            items.forEach((item: { nombre: string; cantidad: number; precio: number }, idx: number) => {
                const lineNum = (idx + 1).toString();
                const montoTotal = item.cantidad * item.precio;
                const impuestoMonto = Math.round(montoTotal * 0.13 * 100) / 100;
                const montoTotalLinea = montoTotal + impuestoMonto;
                totalImpuestos += impuestoMonto;
                totalVentasNeta += montoTotal;

                detallesObj[lineNum] = {
                    cantidad: item.cantidad.toString(),
                    unidadMedida: 'Unid',
                    detalle: item.nombre,
                    precioUnitario: item.precio.toString(),
                    montoTotal: montoTotal.toString(),
                    subtotal: montoTotal.toString(),
                    montoTotalLinea: montoTotalLinea.toString(),
                    impuesto: {
                        '1': {
                            codigo: '01',
                            tarifa: '13',
                            monto: impuestoMonto.toString(),
                        },
                    },
                };
            });

            const totalComprobante = totalVentasNeta + totalImpuestos;
            const fechaEmision = new Date().toISOString().replace('Z', '-06:00');

            const totales = {
                totalServGravados: 0,
                totalServExentos: 0,
                totalMercGravada: totalVentasNeta,
                totalMercExenta: 0,
                totalGravados: totalVentasNeta,
                totalExentos: 0,
                totalVentas: totalVentasNeta,
                totalDescuentos: 0,
                totalVentasNeta,
                totalImpuestos,
                totalComprobante,
            };


            const xmlResp = await this.generarXML(
                config, claveResp.clave!, claveResp.consecutivo!, fechaEmision,
                receptor, JSON.stringify(detallesObj), totales,
                request.condicion_venta || '01', request.medio_pago || '01',
                request.moneda || 'CRC', request.tipo_cambio || 1,
                request.notas || ''
            );

            if (!xmlResp.xml) {
                return this.handleError('Error al generar XML: ' + JSON.stringify(xmlResp));
            }


            const firmaResp = await this.firmarXML(config, xmlResp.xml);
            const xmlFirmado = firmaResp.xmlFirmado || firmaResp.xml || '';


            const tokenResp = await this.obtenerToken(config);
            if (!tokenResp.access_token) {

                const facturaData = {
                    empresa_id: empresaId,
                    orden_id: request.orden_id,
                    cliente_fiscal_id: request.cliente_fiscal_id || null,
                    tipo_documento: tipoDoc,
                    clave_hacienda: claveResp.clave,
                    consecutivo: claveResp.consecutivo,
                    fecha_emision: fechaEmision,
                    condicion_venta: request.condicion_venta || '01',
                    medio_pago: request.medio_pago || '01',
                    moneda: request.moneda || 'CRC',
                    tipo_cambio: request.tipo_cambio || 1,
                    subtotal: totalVentasNeta,
                    total_descuentos: 0,
                    total_impuestos: totalImpuestos,
                    total_comprobante: totalComprobante,
                    total_serv_gravados: 0,
                    total_serv_exentos: 0,
                    total_merc_gravada: totalVentasNeta,
                    total_merc_exenta: 0,
                    total_gravados: totalVentasNeta,
                    total_exentos: 0,
                    total_ventas: totalVentasNeta,
                    total_ventas_neta: totalVentasNeta,
                    xml_sin_firmar: xmlResp.xml || '',
                    xml_firmado: xmlFirmado as string,
                    estado_hacienda: 'error' as const,
                    respuesta_hacienda: { error: 'No se pudo obtener token de Hacienda', tokenResp },
                    notas: request.notas || '',
                };

                const { data: factura } = await supabase
                    .from(this.facturaTable)
                    .insert(facturaData)
                    .select()
                    .maybeSingle();

                if (factura) await this.guardarDetalles(factura.id, items);
                return this.handleResponse<FacturaElectronica>(factura as FacturaElectronica, null);
            }


            const envioResp = await this.enviarHacienda(
                config,
                tokenResp.access_token,
                claveResp.clave!,
                fechaEmision,
                TIPO_CEDULA_HACIENDA[config.tipo_cedula],
                config.cedula,
                receptor.tipoCedula,
                receptor.cedula,
                xmlFirmado as string,
            );

            const estadoHacienda = envioResp.status === 202 ? 'enviado' : 'error';


            const facturaData = {
                empresa_id: empresaId,
                orden_id: request.orden_id,
                cliente_fiscal_id: request.cliente_fiscal_id || null,
                tipo_documento: tipoDoc,
                clave_hacienda: claveResp.clave,
                consecutivo: claveResp.consecutivo,
                fecha_emision: fechaEmision,
                condicion_venta: request.condicion_venta || '01',
                medio_pago: request.medio_pago || '01',
                moneda: request.moneda || 'CRC',
                tipo_cambio: request.tipo_cambio || 1,
                subtotal: totalVentasNeta,
                total_descuentos: 0,
                total_impuestos: totalImpuestos,
                total_comprobante: totalComprobante,
                total_serv_gravados: 0,
                total_serv_exentos: 0,
                total_merc_gravada: totalVentasNeta,
                total_merc_exenta: 0,
                total_gravados: totalVentasNeta,
                total_exentos: 0,
                total_ventas: totalVentasNeta,
                total_ventas_neta: totalVentasNeta,
                xml_sin_firmar: xmlResp.xml || '',
                xml_firmado: xmlFirmado as string,
                estado_hacienda: estadoHacienda as 'enviado' | 'error',
                respuesta_hacienda: envioResp,
                notas: request.notas || '',
            };

            const { data: factura, error: facturaError } = await supabase
                .from(this.facturaTable)
                .insert(facturaData)
                .select()
                .maybeSingle();

            if (facturaError) return this.handleError(facturaError);


            if (factura) await this.guardarDetalles(factura.id, items);

            return this.handleResponse<FacturaElectronica>(factura as FacturaElectronica, null);
        } catch (error) {
            return this.handleError<FacturaElectronica>(error);
        }
    }


    private async guardarDetalles(
        facturaId: string,
        items: Array<{ nombre: string; cantidad: number; precio: number }>
    ): Promise<void> {
        const supabase = await this.getSupabase();
        const detalles = items.map((item, idx) => {
            const montoTotal = item.cantidad * item.precio;
            const impuestoMonto = Math.round(montoTotal * 0.13 * 100) / 100;
            return {
                factura_id: facturaId,
                numero_linea: idx + 1,
                cantidad: item.cantidad,
                unidad_medida: 'Unid',
                detalle: item.nombre,
                precio_unitario: item.precio,
                monto_total: montoTotal,
                monto_descuento: 0,
                subtotal: montoTotal,
                impuesto_codigo: '01',
                impuesto_tarifa: 13,
                impuesto_monto: impuestoMonto,
                monto_total_linea: montoTotal + impuestoMonto,
            };
        });

        await supabase.from(this.detalleTable).insert(detalles);
    }




    async getFacturas(): Promise<ApiResponse<FacturaElectronica[]>> {
        try {
            const empresaId = await this.getEmpresaId();
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.facturaTable)
                .select('*, cliente_fiscal(*), detalles:factura_detalle(*)')
                .eq('empresa_id', empresaId)
                .order('created_at', { ascending: false });

            return this.handleResponse<FacturaElectronica[]>(data as FacturaElectronica[], error);
        } catch (error) {
            return this.handleError<FacturaElectronica[]>(error);
        }
    }

    async getFactura(id: string): Promise<ApiResponse<FacturaElectronica>> {
        try {
            const supabase = await this.getSupabase();
            const { data, error } = await supabase
                .from(this.facturaTable)
                .select('*, cliente_fiscal(*), detalles:factura_detalle(*)')
                .eq('id', id)
                .maybeSingle();

            return this.handleResponse<FacturaElectronica>(data as FacturaElectronica, error);
        } catch (error) {
            return this.handleError<FacturaElectronica>(error);
        }
    }
}

export const haciendaService = new HaciendaService();
