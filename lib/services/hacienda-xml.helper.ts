import { execFile } from 'child_process';
import path from 'path';

export const TIPO_DOC_NAMES: Record<string, string> = {
    '01': 'FacturaElectronica',
    '02': 'NotaDebitoElectronica',
    '03': 'NotaCreditoElectronica',
    '04': 'TiqueteElectronico',
};

export const TIPO_DOC_NS: Record<string, string> = {
    '01': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/facturaElectronica',
    '02': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/notaDebitoElectronica',
    '03': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/notaCreditoElectronica',
    '04': 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.4/tiqueteElectronico',
};

export function escapeXml(str: any): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function buildXml(params: any): string {
    const docName = TIPO_DOC_NAMES[params.tipo_documento] || 'FacturaElectronica';
    const ns = TIPO_DOC_NS[params.tipo_documento] || TIPO_DOC_NS['01'];
    const fechaISO = new Date(params.fecha).toISOString();

    let receptorXml = '';
    if (params.receptor && params.receptor.identificacion) {
        receptorXml = `
  <Receptor>
    <Nombre>${escapeXml(params.receptor.nombre || 'Cliente')}</Nombre>
    <Identificacion>
      <Tipo>${escapeXml(params.receptor.tipo_identificacion || '01')}</Tipo>
      <Numero>${escapeXml(params.receptor.identificacion)}</Numero>
    </Identificacion>
    ${params.receptor.email ? `<CorreoElectronico>${escapeXml(params.receptor.email)}</CorreoElectronico>` : ''}
  </Receptor>`;
    }

    let detalleLines: string[] = [];
    let lineaNum = 1;
    console.log("Generando XML: items en detalle =", params.detalle?.length);
    for (const item of params.detalle) {
        const subtotalItem = item.precio_unitario * item.cantidad;
        const impuestoItem = subtotalItem * 0.13;
        const totalLinea = subtotalItem + impuestoItem;
        detalleLines.push(`
    <LineaDetalle>
      <NumeroLinea>${lineaNum}</NumeroLinea>
      ${item.codigo_cabys ? `<CodigoCABYS>${escapeXml(item.codigo_cabys)}</CodigoCABYS>` : ''}
      <Cantidad>${item.cantidad.toFixed(3)}</Cantidad>
      <UnidadMedida>Unid</UnidadMedida>
      <Detalle>${escapeXml(item.nombre)}</Detalle>
      <PrecioUnitario>${item.precio_unitario.toFixed(5)}</PrecioUnitario>
      <MontoTotal>${subtotalItem.toFixed(5)}</MontoTotal>
      <SubTotal>${subtotalItem.toFixed(5)}</SubTotal>
      <BaseImponible>${subtotalItem.toFixed(5)}</BaseImponible>
      <Impuesto>
        <Codigo>01</Codigo>
        <CodigoTarifaIVA>08</CodigoTarifaIVA>
        <Tarifa>13.00</Tarifa>
        <Monto>${impuestoItem.toFixed(5)}</Monto>
      </Impuesto>
      <ImpuestoAsumidoEmisorFabrica>0.00000</ImpuestoAsumidoEmisorFabrica>
      <ImpuestoNeto>${impuestoItem.toFixed(5)}</ImpuestoNeto>
      <MontoTotalLinea>${totalLinea.toFixed(5)}</MontoTotalLinea>
    </LineaDetalle>`);
        lineaNum++;
    }
    const cedulaEmisorClean = (params.config.cedula_emisor || '').replace(/\D/g, '');

    return `<?xml version="1.0" encoding="utf-8"?>
<${docName} xmlns="${ns}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <Clave>${params.clave}</Clave>
  <ProveedorSistemas>${cedulaEmisorClean}</ProveedorSistemas>
  <CodigoActividadEmisor>${escapeXml(params.config.codigo_actividad)}</CodigoActividadEmisor>
  <NumeroConsecutivo>${params.consecutivo}</NumeroConsecutivo>
  <FechaEmision>${fechaISO}</FechaEmision>
  <Emisor>
    <Nombre>${escapeXml(params.config.nombre_emisor)}</Nombre>
    <Identificacion>
      <Tipo>${escapeXml(params.config.tipo_identificacion_emisor)}</Tipo>
      <Numero>${cedulaEmisorClean}</Numero>
    </Identificacion>
    ${params.config.nombre_comercial ? `<NombreComercial>${escapeXml(params.config.nombre_comercial)}</NombreComercial>` : ''}
    <Ubicacion>
      <Provincia>${escapeXml(params.config.provincia)}</Provincia>
      <Canton>${escapeXml(params.config.canton)}</Canton>
      <Distrito>${escapeXml(params.config.distrito)}</Distrito>
      <OtrasSenas>${escapeXml(params.config.otras_senas || 'Sin otras señas')}</OtrasSenas>
    </Ubicacion>
    ${params.config.telefono ? `<Telefono><CodigoPais>506</CodigoPais><NumTelefono>${escapeXml(params.config.telefono)}</NumTelefono></Telefono>` : ''}
    <CorreoElectronico>${escapeXml(params.config.email)}</CorreoElectronico>
  </Emisor>${receptorXml}
  <CondicionVenta>01</CondicionVenta>
  <DetalleServicio>${detalleLines.join('')}
  </DetalleServicio>
  <ResumenFactura>
    <CodigoTipoMoneda><CodigoMoneda>CRC</CodigoMoneda><TipoCambio>1</TipoCambio></CodigoTipoMoneda>
    <TotalServGravados>0.00000</TotalServGravados>
    <TotalServExentos>0.00000</TotalServExentos>
    <TotalServExonerado>0.00000</TotalServExonerado>
    <TotalServNoSujeto>0.00000</TotalServNoSujeto>
    <TotalMercanciasGravadas>${params.subtotal.toFixed(5)}</TotalMercanciasGravadas>
    <TotalMercanciasExentas>0.00000</TotalMercanciasExentas>
    <TotalMercExonerada>0.00000</TotalMercExonerada>
    <TotalMercNoSujeta>0.00000</TotalMercNoSujeta>
    <TotalGravado>${params.subtotal.toFixed(5)}</TotalGravado>
    <TotalExento>0.00000</TotalExento>
    <TotalExonerado>0.00000</TotalExonerado>
    <TotalNoSujeto>0.00000</TotalNoSujeto>
    <TotalVenta>${params.subtotal.toFixed(5)}</TotalVenta>
    <TotalDescuentos>0.00000</TotalDescuentos>
    <TotalVentaNeta>${params.subtotal.toFixed(5)}</TotalVentaNeta>
    <TotalDesgloseImpuesto>
      <Codigo>01</Codigo>
      <CodigoTarifaIVA>08</CodigoTarifaIVA>
      <TotalMontoImpuesto>${params.impuesto.toFixed(5)}</TotalMontoImpuesto>
    </TotalDesgloseImpuesto>
    <TotalImpuesto>${params.impuesto.toFixed(5)}</TotalImpuesto>
    <TotalIVADevuelto>0.00000</TotalIVADevuelto>
    <TotalOtrosCargos>0.00000</TotalOtrosCargos>
    <MedioPago>
      <TipoMedioPago>01</TipoMedioPago>
    </MedioPago>
    <TotalComprobante>${params.total.toFixed(5)}</TotalComprobante>
  </ResumenFactura>
</${docName}>`;
}

/**
 * Firma XAdES-EPES ejecutando la librería haciendacostarica-signer en un proceso 
 * Node.js externo. Esto evita que el bundler de Next.js altere los objetos 
 * WebCrypto internos, que era la causa raíz del error "toUpperCase".
 */
export async function signXmlHacienda(xmlString: string, p12Base64: string, p12Pin: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log("[Signer] Ejecutando firma XAdES-EPES en proceso externo...");

        const xmlBase64 = Buffer.from(xmlString).toString('base64');
        const scriptPath = path.join(process.cwd(), 'sign-xml.js');
        const nodePath = '/opt/homebrew/bin/node';

        execFile(nodePath, [scriptPath, xmlBase64, p12Base64, p12Pin], {
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            timeout: 30000, // 30 second timeout
        }, (error, stdout, stderr) => {
            if (error) {
                console.error("[Signer] STDERR completo:", stderr);
                const errorMsg = stderr?.includes('SIGN_ERROR:') 
                    ? stderr.split('SIGN_ERROR:')[1]?.split('\n')[0]?.trim() 
                    : error.message;
                console.error("[Signer] Error en proceso externo:", errorMsg);
                reject(new Error(`Firma fallida: ${errorMsg}`));
                return;
            }

            const signedXmlBase64 = stdout.trim();
            if (!signedXmlBase64) {
                reject(new Error('Firma fallida: El proceso no devolvió resultado'));
                return;
            }

            console.log("[Signer] ¡Firma XAdES-EPES completada con éxito!");
            resolve(signedXmlBase64);
        });
    });
}
