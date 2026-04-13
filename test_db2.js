const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('/Users/scruz/Documents/nora_control/.env.local', 'utf-8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1] || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];
const s = createClient(SUPABASE_URL, SUPABASE_KEY);
s.from('config_facturacion').select('cedula_emisor, provincia, canton, distrito, barrio').then(r => console.log("DB VALUES:", r.data));
