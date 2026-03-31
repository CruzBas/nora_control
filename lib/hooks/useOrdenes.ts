'use client';

import { useState, useEffect, useCallback } from 'react';
import { Orden } from '@/lib/types';
import { getOrdenesActivasAction } from '@/lib/actions/ordenes.actions';

export function useOrdenes() {
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrdenes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getOrdenesActivasAction();
            if (res.success && res.data) {
                setOrdenes(res.data);
                setError(null);
            } else {
                setError(res.error ?? 'Error al cargar órdenes');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrdenes();
        // Polling cada 15 segundos para actualizar estado en tiempo real
        const interval = setInterval(fetchOrdenes, 15000);
        return () => clearInterval(interval);
    }, [fetchOrdenes]);

    return { ordenes, loading, error, refresh: fetchOrdenes };
}
