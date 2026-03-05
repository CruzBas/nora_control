import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // En build o entornos sin config, devolvemos un cliente básico 
        // o manejamos el error de forma que no detenga el proceso.
        console.warn('Supabase URL or Key missing. This is expected during some build phases if envs are not provided.');
    }

    return createBrowserClient(
        url || '',
        key || ''
    )
}
