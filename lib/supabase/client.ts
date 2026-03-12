import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!url || !key) {

        console.warn('Supabase URL or Key missing. This is expected during some build phases if envs are not provided.');
    }

    return createBrowserClient(
        url || '',
        key || ''
    )
}
