import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const forge = require('node-forge');
const crypto = require('crypto');
const { SignedXml, C14nCanonicalization } = require('xml-crypto');

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

/**
 * Firma XAdES-EPES usando xml-crypto v6 para C14N + node.js crypto para firma.
 * 
 * ESTRATEGIA: Usar xml-crypto solo para la firma enveloped del documento.
 * Luego, calcular el digest de SignedProperties manualmente usando C14N de xml-crypto,
 * e inyectar la referencia extra y las QualifyingProperties en el XML final,
 * recalculando la SignatureValue.
 */
export async function signXmlHacienda(xmlString: string, p12Base64: string, p12Pin: string): Promise<string> {
    try {
        console.log("[Signer] Iniciando firma XAdES-EPES (xml-crypto + manual XAdES)...");

        // ── 1. Extraer llave privada y certificado del P12 ──
        const p12Der = forge.util.decode64(p12Base64);
        const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(p12Der), true, p12Pin);
        const pkBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] ||
                       p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || [];
        if (!pkBags?.length) throw new Error("No se encontró la llave privada");
        const privateKeyPem = forge.pki.privateKeyToPem(pkBags[0].key);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
        if (!certBags?.length) throw new Error("No se encontró el certificado");
        const certificate = certBags[0].cert;
        const certBase64 = forge.pki.certificateToPem(certificate)
            .replace('-----BEGIN CERTIFICATE-----', '')
            .replace('-----END CERTIFICATE-----', '')
            .replace(/\r?\n/g, '');

        // ── 2. Metadatos del certificado ──
        const certDerBytes = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
        const certDigest = crypto.createHash('sha256').update(Buffer.from(certDerBytes, 'binary')).digest('base64');
        const issuerName = certificate.issuer.attributes.map((a: any) => `${a.shortName}=${a.value}`).join(',');
        const serialNumber = certificate.serialNumber;

        // ── 3. IDs y timestamp ──
        const uniqueId = Date.now().toString();
        const sigId = `Signature-${uniqueId}`;
        const propId = `SignedProperties-${uniqueId}`;
        const ts = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

        // ── 4. PASO 1: Firma base del documento con xml-crypto (solo enveloped) ──
        console.log("[Signer] Paso 1: Firma enveloped del documento...");
        const sig = new SignedXml({
            privateKey: privateKeyPem,
            signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
            canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
        });

        // Solo el documento principal
        sig.addReference({
            xpath: '/*',
            transforms: [
                'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
                'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
            ],
            digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
            uri: '',
            isEmptyUri: true,
        });

        sig.getKeyInfoContent = () =>
            `<ds:X509Data><ds:X509Certificate>${certBase64}</ds:X509Certificate></ds:X509Data>`;

        sig.computeSignature(xmlString, {
            prefix: 'ds',
            attrs: { Id: sigId },
            location: { reference: '/*', action: 'append' },
        });

        let baseSignedXml = sig.getSignedXml();
        console.log("[Signer] Paso 1 completado. Firma base generada.");

        // ── 5. PASO 2: Construir QualifyingProperties ──
        const qualifyingProperties =
            `<xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Target="#${sigId}">` +
            `<xades:SignedProperties Id="${propId}">` +
            `<xades:SignedSignatureProperties>` +
            `<xades:SigningTime>${ts}</xades:SigningTime>` +
            `<xades:SigningCertificate>` +
            `<xades:Cert>` +
            `<xades:CertDigest>` +
            `<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>` +
            `<ds:DigestValue>${certDigest}</ds:DigestValue>` +
            `</xades:CertDigest>` +
            `<xades:IssuerSerial>` +
            `<ds:X509IssuerName>${issuerName}</ds:X509IssuerName>` +
            `<ds:X509SerialNumber>${serialNumber}</ds:X509SerialNumber>` +
            `</xades:IssuerSerial>` +
            `</xades:Cert>` +
            `</xades:SigningCertificate>` +
            `<xades:SignaturePolicyIdentifier>` +
            `<xades:SignaturePolicyId>` +
            `<xades:SigPolicyId>` +
            `<xades:Identifier Qualifier="OIDAsURI">https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/poliza-de-firma-electronica-v4.3.pdf</xades:Identifier>` +
            `</xades:SigPolicyId>` +
            `<xades:SigPolicyHash>` +
            `<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>` +
            `<ds:DigestValue>V8lVV6GseUqv97qnAnEsh97At9c=</ds:DigestValue>` +
            `</xades:SigPolicyHash>` +
            `</xades:SignaturePolicyId>` +
            `</xades:SignaturePolicyIdentifier>` +
            `<xades:SignerRole>` +
            `<xades:ClaimedRoles>` +
            `<xades:ClaimedRole>ObligadoTributario</xades:ClaimedRole>` +
            `</xades:ClaimedRoles>` +
            `</xades:SignerRole>` +
            `</xades:SignedSignatureProperties>` +
            `</xades:SignedProperties>` +
            `</xades:QualifyingProperties>`;

        // ── 6. PASO 3: Calcular el digest C14N del SignedProperties ──
        console.log("[Signer] Paso 2: Calculando digest C14N de SignedProperties...");
        const propsDoc = new DOMParser().parseFromString(qualifyingProperties, 'text/xml');
        const signedPropsNodes = propsDoc.getElementsByTagName('xades:SignedProperties');
        if (!signedPropsNodes || signedPropsNodes.length === 0) {
            throw new Error("No se pudo parsear SignedProperties del QualifyingProperties");
        }
        const c14n = new C14nCanonicalization();
        const canonicalSignedProps = c14n.process(signedPropsNodes[0], { inclusiveNamespacesPrefixList: [] }).toString();
        const propsDigest = crypto.createHash('sha256').update(canonicalSignedProps).digest('base64');

        // ── 7. PASO 4: Inyectar la referencia a SignedProperties en SignedInfo ──
        console.log("[Signer] Paso 3: Inyectando referencia XAdES y recalculando firma...");
        const propsReferenceXml =
            `<ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#${propId}">` +
            `<ds:Transforms><ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" /></ds:Transforms>` +
            `<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />` +
            `<ds:DigestValue>${propsDigest}</ds:DigestValue>` +
            `</ds:Reference>`;

        // Insertar la referencia extra en SignedInfo (antes de </ds:SignedInfo>)
        baseSignedXml = baseSignedXml.replace('</ds:SignedInfo>', propsReferenceXml + '</ds:SignedInfo>');

        // Insertar QualifyingProperties como ds:Object (antes de </ds:Signature>)
        baseSignedXml = baseSignedXml.replace('</ds:Signature>', `<ds:Object>${qualifyingProperties}</ds:Object></ds:Signature>`);

        // ── 8. PASO 5: Recalcular SignatureValue sobre el nuevo SignedInfo ──
        const signedInfoMatch = baseSignedXml.match(/<ds:SignedInfo[^]*?<\/ds:SignedInfo>/);
        if (!signedInfoMatch) throw new Error("No se pudo extraer SignedInfo del XML firmado");

        // Canonicalizar el SignedInfo actualizado
        // IMPORTANTE: Agregar xmlns:ds al extraer SignedInfo standalone, porque en el XML
        // original hereda el namespace de <ds:Signature xmlns:ds="...">.
        // Sin esto, la C14N produce un resultado diferente y la firma no valida.
        let signedInfoForC14N = signedInfoMatch[0];
        if (!signedInfoForC14N.includes('xmlns:ds=')) {
            signedInfoForC14N = signedInfoForC14N.replace(
                '<ds:SignedInfo',
                '<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"'
            );
        }
        const signedInfoDoc = new DOMParser().parseFromString(signedInfoForC14N, 'text/xml');
        const canonicalSignedInfo = c14n.process(signedInfoDoc.documentElement, { inclusiveNamespacesPrefixList: [] }).toString();

        // Firmar con Node.js crypto
        const signer = crypto.createSign('RSA-SHA256');
        signer.update(canonicalSignedInfo);
        const newSignatureValue = signer.sign(privateKeyPem, 'base64');

        // Reemplazar el SignatureValue original
        baseSignedXml = baseSignedXml.replace(
            /<ds:SignatureValue>[^<]+<\/ds:SignatureValue>/,
            `<ds:SignatureValue>${newSignatureValue}</ds:SignatureValue>`
        );

        console.log("[Signer] ¡Firma XAdES-EPES completada con éxito!");
        return Buffer.from(baseSignedXml).toString('base64');

    } catch (err: any) {
        console.error("[Signer] Error:", err.message || err);
        throw new Error(`Firma fallida: ${err.message || err}`);
    }
}
