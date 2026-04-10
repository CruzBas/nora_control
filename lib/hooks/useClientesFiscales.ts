'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClienteFiscal } from '../types/facturacion';

export function useClientesFiscales() {
    const [clientes, setClientes] = useState<ClienteFiscal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/facturacion/clientes');
            const result = await res.json();
            if (result.success && result.data) {
                setClientes(result.data);
            }
        } catch (err) {
            console.error('Error fetching clientes:', err);
        }
        setLoading(false);
    }, []);

    const createCliente = useCallback(async (data: Partial<ClienteFiscal>) => {
        try {
            const res = await fetch('/api/facturacion/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) await fetchClientes();
            return result;
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    }, [fetchClientes]);

    const updateCliente = useCallback(async (id: string, data: Partial<ClienteFiscal>) => {
        try {
            const res = await fetch(`/api/facturacion/clientes?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success) await fetchClientes();
            return result;
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    }, [fetchClientes]);

    const deleteCliente = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/facturacion/clientes?id=${id}`, {
                method: 'DELETE',
            });
            const result = await res.json();
            if (result.success) await fetchClientes();
            return result;
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    }, [fetchClientes]);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    return {
        clientes,
        loading,
        fetchClientes,
        createCliente,
        updateCliente,
        deleteCliente,
    };
}
