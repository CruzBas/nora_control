import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export const api = {
    async get(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: await getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(error.message || 'Error en la petición');
        }
        return response.json();
    },

    async post(endpoint: string, body: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(error.message || 'Error en la petición');
        }
        return response.json();
    },

    async put(endpoint: string, body: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(error.message || 'Error en la petición');
        }
        return response.json();
    },

    async delete(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(error.message || 'Error en la petición');
        }
        return response.json();
    },
};
