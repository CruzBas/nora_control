const { buildXml, signXmlHacienda } = require('./lib/services/hacienda-xml.helper');
const { createClient } = require('@supabase/supabase-js');

async function debugSign() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: cfg } = await supabase.from('config_facturacion').select('*').limit(1).single();
    
    if (!cfg) return console.log("No config");
    
    try {
        console.log("Trying to sign XML...");
        // minimal dummy XML for test
        const testXml = "<test></test>";
        const signed = await signXmlHacienda(testXml, cfg.archivo_p12, cfg.pin_p12);
        console.log("Success! Starts with:", signed.substring(0, 30));
    } catch(err) {
        console.error("Signer failed with error:", err);
    }
}

debugSign();
