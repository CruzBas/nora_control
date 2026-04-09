'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UsuarioInfo {
    id: string;
    nombre: string | null;
    apellido: string | null;
    email: string | null;
    empresa_id: string;

    rol: string;
    rol_id: string;
}

export interface AccesoTemporal {
    pagina: string;
    acceso_hasta: string;
}

export function useUsuario() {
    const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
    const [accesosTemporales, setAccesosTemporales] = useState<AccesoTemporal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsuario = useCallback(async () => {
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setUsuario(null);
                setLoading(false);
                return;
            }


            const { data: profile } = await supabase
                .from('usuario')
                .select('*, rol(nombre)')
                .eq('id', user.id)
                .maybeSingle();

            if (profile) {
                setUsuario({
                    id: profile.id,
                    nombre: profile.nombre,
                    apellido: profile.apellido,
                    email: profile.email,
                    empresa_id: profile.empresa_id,
                    rol: (profile.rol as any)?.nombre || 'Cajero',
                    rol_id: profile.rol_id,
                });


                const { data: accesos } = await supabase
                    .from('solicitud_acceso')
                    .select('pagina, acceso_hasta')
                    .eq('usuario_id', user.id)
                    .eq('estado', 'aprobada')
                    .gt('acceso_hasta', new Date().toISOString());

                setAccesosTemporales(accesos || []);
            }
        } catch (err) {
            console.error('Error fetching usuario:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsuario();
    }, [fetchUsuario]);


    const tieneAccesoTemporal = useCallback((pagina: string): boolean => {
        return accesosTemporales.some(
            a => a.pagina === pagina && new Date(a.acceso_hasta) > new Date()
        );
    }, [accesosTemporales]);

    return {
        usuario,
        loading,
        tieneAccesoTemporal,
        refetch: fetchUsuario,
    };
}
