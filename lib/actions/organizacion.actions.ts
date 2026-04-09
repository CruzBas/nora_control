'use server';

import { organizacionService } from '@/lib/services/organizacion.service';


async function requireAdmin() {
    const esAdmin = await organizacionService.verificarRolAdmin();
    if (!esAdmin) {
        return { success: false, data: null, error: 'Acceso denegado. Solo Master y Admin pueden gestionar organizaciones.' };
    }
    return null;
}


export async function listarOrganizacionesAction() {
    const denied = await requireAdmin();
    if (denied) return denied;
    return organizacionService.getOrganizaciones();
}


export async function listarEmpresasAction() {
    const denied = await requireAdmin();
    if (denied) return denied;
    return organizacionService.getEmpresas();
}


export async function crearOrganizacionAction(nombre: string) {
    const denied = await requireAdmin();
    if (denied) return denied;

    if (!nombre?.trim()) {
        return { success: false, data: null, error: 'El nombre de la organización es obligatorio.' };
    }

    return organizacionService.createOrganizacion(nombre.trim());
}


export async function actualizarOrganizacionAction(id: string, nombre: string) {
    const denied = await requireAdmin();
    if (denied) return denied;

    if (!id || !nombre?.trim()) {
        return { success: false, data: null, error: 'ID y nombre son obligatorios.' };
    }

    return organizacionService.updateOrganizacion(id, nombre.trim());
}


export async function eliminarOrganizacionAction(id: string) {
    const denied = await requireAdmin();
    if (denied) return denied;

    if (!id) {
        return { success: false, data: null, error: 'ID de organización no válido.' };
    }

    return organizacionService.deleteOrganizacion(id);
}


export async function crearEmpresaAction(
    nombre: string,
    organizacionId: string,
    pais?: string,
    ubicacion?: string
) {
    const denied = await requireAdmin();
    if (denied) return denied;

    if (!nombre?.trim()) {
        return { success: false, data: null, error: 'El nombre de la empresa es obligatorio.' };
    }
    if (!organizacionId) {
        return { success: false, data: null, error: 'Debe seleccionar una organización.' };
    }

    return organizacionService.createEmpresa(nombre.trim(), organizacionId, pais?.trim(), ubicacion?.trim());
}


export async function asignarEmpresaAction(empresaId: string, organizacionId: string | null) {
    const denied = await requireAdmin();
    if (denied) return denied;

    if (!empresaId) {
        return { success: false, data: null, error: 'ID de empresa no válido.' };
    }

    return organizacionService.asignarEmpresaAOrganizacion(empresaId, organizacionId);
}

export async function actualizarEmpresaAction(
    id: string,
    fields: { nombre?: string; pais?: string | null; ubicacion?: string | null }
) {
    const denied = await requireAdmin();
    if (denied) return denied;

    if (!id) {
        return { success: false, data: null, error: 'ID de empresa no válido.' };
    }
    if (fields.nombre !== undefined && !fields.nombre?.trim()) {
        return { success: false, data: null, error: 'El nombre no puede estar vacío.' };
    }

    return organizacionService.updateEmpresa(id, {
        nombre: fields.nombre?.trim(),
        pais: fields.pais?.trim() || null,
        ubicacion: fields.ubicacion?.trim() || null,
    });
}
