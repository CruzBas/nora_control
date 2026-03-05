import { createClient } from '@supabase/supabase-js';

// Usamos las variables de entorno, con los valores reales como backup 
// para evitar errores de DNS (ERR_NAME_NOT_RESOLVED) si el build no las detecta.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://moxdocvtqtsapzasnwsx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1veGRvY3Z0cXRzYXB6YXNud3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTgwMzksImV4cCI6MjA4NzY5NDAzOX0.ragZkT_xQJSVGb90wM51UVmIZKz0jNudVcf8XUKCN9g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
