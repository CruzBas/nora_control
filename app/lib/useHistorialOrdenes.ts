'use client';

import { useState, useEffect, useCallback } from 'react';
import { Orden } from '@/lib/types';
import { getOrdenesTerminadasHoyAction } from '@/lib/actions/ordenes.actions';

export function useHistorialOrdenes() {
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistorial = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getOrdenesTerminadasHoyAction();
            if (res.success && res.data) {
                setOrdenes(res.data);
                setError(null);
            } else {
                setError(res.error ?? 'Error al cargar historial');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistorial();
        // Polling cada minuto para el historial
        const interval = setInterval(fetchHistorial, 60000);
        return () => clearInterval(interval);
    }, [fetchHistorial]);

    return { ordenes, loading, error, refresh: fetchHistorial };
}
