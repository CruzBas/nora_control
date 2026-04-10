'use client';

import { useState, useEffect, useCallback } from 'react';
import { FacturaElectronica, ConfigFiscal } from '../types/facturacion';

export function useFacturacion() {
    const [facturas, setFacturas] = useState<FacturaElectronica[]>([]);
    const [config, setConfig] = useState<ConfigFiscal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFacturas = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/facturacion/facturas');
            const result = await res.json();
            if (result.success && result.data) {
                setFacturas(result.data);
            } else {
                setError(result.error || 'Error al cargar facturas');
            }
        } catch (err) {
            setError((err as Error).message);
        }
        setLoading(false);
    }, []);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/facturacion/config');
            const result = await res.json();
            if (result.success && result.data) {
                setConfig(result.data);
            }
        } catch (err) {
            console.error('Error fetching config:', err);
        }
    }, []);

    const saveConfig = useCallback(async (data: Partial<ConfigFiscal>) => {
        try {
            const res = await fetch('/api/facturacion/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (result.success && result.data) {
                setConfig(result.data);
            }
            return result;
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    }, []);

    useEffect(() => {
        fetchFacturas();
        fetchConfig();
    }, [fetchFacturas, fetchConfig]);

    return {
        facturas,
        config,
        loading,
        error,
        fetchFacturas,
        fetchConfig,
        saveConfig,
    };
}
