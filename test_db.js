const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/scruz/Documents/nora_control/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
s.from('config_facturacion').select('*').then(r => console.log(r.data));
