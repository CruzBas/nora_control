import { useState, useEffect, useCallback } from 'react';
import { getProveedoresAction, deleteProveedorAction } from '../actions/proveedor.actions';
import { Proveedor } from '../types';

export function useProveedores() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getProveedoresAction();
            if (result.success && result.data) {
                setProveedores(result.data);
            } else {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const deleteProveedor = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return;
        
        try {
            const result = await deleteProveedorAction(id);
            if (result.success) {
                loadData();
            } else {
                alert(result.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    };

    return {
        proveedores,
        loading,
        error,
        refresh: loadData,
        deleteProveedor
    };
}
