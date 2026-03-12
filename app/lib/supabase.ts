import { createClient } from '@supabase/supabase-js';

// Usamos las variables de entorno, con los valores reales como backup 
// para evitar errores de DNS (ERR_NAME_NOT_RESOLVED) si el build no las detecta.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qwerquacvpipxgnynbro.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_i0q0ySPcKxCAsQaL1qJyNg_TX3pWsAX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
