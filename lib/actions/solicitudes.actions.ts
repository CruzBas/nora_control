'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Crea una solicitud de acceso temporal para una página.
 */
export async function crearSolicitudAction(pagina: string, motivo: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    // Verificar que no exista ya una solicitud pendiente para esta página
    const { data: existente } = await supabase
        .from('solicitud_acceso')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('pagina', pagina)
        .eq('estado', 'pendiente')
        .maybeSingle();

    if (existente) {
        return { success: false, error: 'Ya tienes una solicitud pendiente para esta sección' };
    }

    const { error } = await supabase
        .from('solicitud_acceso')
        .insert({
            usuario_id: user.id,
            pagina,
            motivo: motivo || null,
        });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
}

/**
 * Lista todas las solicitudes (para Master/Admin).
 */
export async function listarSolicitudesAction() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('solicitud_acceso')
        .select('*, usuario:usuario_id(nombre, apellido, email)')
        .order('created_at', { ascending: false });

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data, error: null };
}

/**
 * Aprueba una solicitud y establece la expiración del acceso temporal.
 * @param duracionHoras - Duración en horas del acceso temporal.
 */
export async function aprobarSolicitudAction(solicitudId: string, duracionHoras: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    const accesoHasta = new Date();
    accesoHasta.setHours(accesoHasta.getHours() + duracionHoras);

    const { error } = await supabase
        .from('solicitud_acceso')
        .update({
            estado: 'aprobada',
            aprobado_por: user.id,
            acceso_hasta: accesoHasta.toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', solicitudId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
}

/**
 * Rechaza una solicitud.
 */
export async function rechazarSolicitudAction(solicitudId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'No autenticado' };

    const { error } = await supabase
        .from('solicitud_acceso')
        .update({
            estado: 'rechazada',
            aprobado_por: user.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', solicitudId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
}

/**
 * Verifica si el usuario actual tiene acceso temporal vigente a una página.
 */
export async function verificarAccesoTemporalAction(pagina: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { tieneAcceso: false };

    const { data } = await supabase
        .from('solicitud_acceso')
        .select('acceso_hasta')
        .eq('usuario_id', user.id)
        .eq('pagina', pagina)
        .eq('estado', 'aprobada')
        .gt('acceso_hasta', new Date().toISOString())
        .maybeSingle();

    return { tieneAcceso: !!data };
}
