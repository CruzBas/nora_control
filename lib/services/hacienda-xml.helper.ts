import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

// Importaciones para la firma manual
const forge = require('node-forge');

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

    let detalleLines = [];
    let lineaNum = 1;
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
    <TotalServGravados>${params.subtotal.toFixed(5)}</TotalServGravados>
    <TotalServExentos>0.00000</TotalServExentos>
    <TotalServExonerado>0.00000</TotalServExonerado>
    <TotalServNoSujeto>0.00000</TotalServNoSujeto>
    <TotalMercanciasGravadas>0.00000</TotalMercanciasGravadas>
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
    <TotalImpuesto>${params.impuesto.toFixed(5)}</TotalImpuesto>
    <TotalImpAsumEmisorFabrica>0.00000</TotalImpAsumEmisorFabrica>
    <TotalIVADevuelto>0.00000</TotalIVADevuelto>
    <TotalOtrosCargos>0.00000</TotalOtrosCargos>
    <MedioPago>
      <TipoMedioPago>01</TipoMedioPago>
    </MedioPago>
    <TotalComprobante>${params.total.toFixed(5)}</TotalComprobante>
  </ResumenFactura>
</${docName}>`;
}

export async function signXmlHacienda(xmlString: string, p12Base64: string, p12Pin: string): Promise<string> {
    try {
        console.log("[Signer] Generando Firma XAdES-EPES Manual (v3)...");

        const p12Der = forge.util.decode64(p12Base64);
        const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(p12Der), true, p12Pin);
        const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || 
                    p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || [];
        const privateKey = bags[0].key;
        const certificate = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0].cert;
        const certBase64 = forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes());

        const ts = new Date().toISOString().split('.')[0] + "Z";
        const sigId = "Signature-738291"; // ID estático para pruebas, luego podemos hacerlo dinámico
        const propId = "SignedProperties-738291";
        const refId = "Reference-738291";

        const mdCert = forge.md.sha256.create();
        mdCert.update(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes());
        const certDigest = forge.util.encode64(mdCert.digest().getBytes());
        // Sin espacios para máxima compatibilidad
        const issuerName = certificate.issuer.attributes.reverse().map((a: any) => `${a.shortName}=${a.value}`).join(',');

        const mdDoc = forge.md.sha256.create();
        mdDoc.update(xmlString, 'utf8');
        const docDigest = forge.util.encode64(mdDoc.digest().getBytes());

        const xadesXml = `<QualifyingProperties xmlns="http://uri.etsi.org/01903/v1.3.2#" Target="#${sigId}"><SignedProperties Id="${propId}"><SignedSignatureProperties><SigningTime>${ts}</SigningTime><SigningCertificate><Cert><CertDigest><ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certDigest}</ds:DigestValue></CertDigest><IssuerSerial><ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${issuerName}</ds:X509IssuerName><ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certificate.serialNumber}</ds:X509SerialNumber></IssuerSerial></Cert></SigningCertificate><SignaturePolicyIdentifier><SignaturePolicyId><SigPolicyId><Identifier Qualifier="OIDAsURI">https://www.hacienda.go.cr/xml-schemas/v4.3/poliza-de-firma-electronica-v4.3.pdf</Identifier></SigPolicyId><SigPolicyHash><ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">V8lVV6GseUqv97qnAnEsh97At9c=</ds:DigestValue></SigPolicyHash></SignaturePolicyId></SignaturePolicyIdentifier><SignerRole><ClaimedRoles><ClaimedRole>ObligadoTributario</ClaimedRole></ClaimedRoles></SignerRole></SignedSignatureProperties></SignedProperties></QualifyingProperties>`;

        const mdProps = forge.md.sha256.create();
        mdProps.update(xadesXml, 'utf8');
        const propsDigest = forge.util.encode64(mdProps.digest().getBytes());

        const signedInfoXml = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference Id="${refId}" URI=""><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${docDigest}</ds:DigestValue></ds:Reference><ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#${propId}"><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${propsDigest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;

        const mdSign = forge.md.sha256.create();
        mdSign.update(signedInfoXml, 'utf8');
        const signatureValue = forge.util.encode64(privateKey.sign(mdSign));

        const fullSignature = `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="${sigId}">${signedInfoXml}<ds:SignatureValue>${signatureValue}</ds:SignatureValue><ds:KeyInfo><ds:X509Data><ds:X509Certificate>${certBase64}</ds:X509Certificate></ds:X509Data></ds:KeyInfo><ds:Object>${xadesXml}</ds:Object></ds:Signature>`;

        const finalSignedXml = xmlString.replace(/<\/[^>]+>$/, match => fullSignature + match);
        return Buffer.from(finalSignedXml).toString("base64");
    } catch (err: any) {
        console.error("[Signer] Error en firma:", err.message || err);
        throw new Error(`Firma fallida: ${err.message || err}`);
    }
}
