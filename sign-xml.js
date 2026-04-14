#!/usr/bin/env node
/**
 * Script independiente para firmar XML con XAdES-EPES para Hacienda Costa Rica.
 * Se ejecuta como proceso externo para evitar incompatibilidades con el bundler de Next.js.
 * 
 * Uso: node sign-xml.js <xmlBase64> <p12Base64> <pin>
 * Salida: XML firmado en base64 en stdout
 */
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const xades = require('xadesjs');
xades.setNodeDependencies({ DOMParser, XMLSerializer });

const signer = require('./node_modules/haciendacostarica-signer');

const args = process.argv.slice(2);
if (args.length < 3) {
    console.error('Uso: node sign-xml.js <xmlBase64> <p12Base64> <pin>');
    process.exit(1);
}

const xmlBase64 = args[0];
const p12Base64 = args[1];
const pin = args[2];

// Decodificar XML de base64
const xmlString = Buffer.from(xmlBase64, 'base64').toString('utf-8');

async function main() {
    try {
        // MUTE CONSOLE.LOG to prevent third-party lib from corrupting stdout with "XADES SIGN OPTIONS..."
        const originalConsoleLog = console.log;
        console.log = () => {};

        const signedXmlBase64 = await signer.sign(xmlString, p12Base64, pin);

        // Restore console if needed, but we just use process.stdout.write
        process.stdout.write(signedXmlBase64);
        process.exit(0);
    } catch (err) {
        console.error('SIGN_ERROR:' + (err.message || err));
        console.error('STACK:' + (err.stack || 'no stack'));
        process.exit(1);
    }
}

main();
