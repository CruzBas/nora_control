'use client';

import { useState, useEffect } from 'react';
import { createProveedorAction, updateProveedorAction } from '@/lib/actions/proveedor.actions';
import { Proveedor } from '@/lib/types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    proveedor?: Proveedor | null;
}

export default function ProveedorModal({ isOpen, onClose, onSuccess, proveedor }: ModalProps) {
    const isEditing = !!proveedor;
    
    const [nombre, setNombre] = useState('');
    const [contacto, setContacto] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (proveedor) {
                setNombre(proveedor.nombre);
                setContacto(proveedor.contacto || '');
                setEmail(proveedor.email || '');
            } else {
                setNombre('');
                setContacto('');
                setEmail('');
            }
            setError(null);
        }
    }, [isOpen, proveedor]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formData = {
                nombre: nombre.trim(),
                contacto: contacto.trim() || undefined,
                email: email.trim() || undefined,
            };

            const result = isEditing && proveedor
                ? await updateProveedorAction(proveedor.id, formData)
                : await createProveedorAction(formData as Omit<Proveedor, 'id' | 'created_at' | 'empresa_id'>);

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                setError(result.error || 'Ocurrió un error al guardar el proveedor.');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nora-blue-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-nora-blue-800 rounded-3xl w-full max-w-md border border-nora-blue-700 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-nora-blue-700 bg-nora-blue-900/30 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-nora-gray-100">
                        {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-nora-gray-400 hover:text-white transition-colors p-1"
                        disabled={isSubmitting}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-nora-danger bg-nora-danger/10 border border-nora-danger/20 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-nora-gray-300 mb-1.5 ml-1">
                                Nombre del Proveedor *
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full bg-nora-blue-900 border border-nora-blue-700 text-nora-gray-100 rounded-xl px-4 py-3 outline-none focus:border-nora-accent-400 focus:ring-1 focus:ring-nora-accent-400 transition-all font-medium"
                                placeholder="Ej: Dos Pinos"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-nora-gray-300 mb-1.5 ml-1">
                                Número de WhatsApp (Contacto)
                            </label>
                            <input
                                type="text"
                                value={contacto}
                                onChange={(e) => setContacto(e.target.value)}
                                className="w-full bg-nora-blue-900 border border-nora-blue-700 text-nora-gray-100 rounded-xl px-4 py-3 outline-none focus:border-nora-accent-400 focus:ring-1 focus:ring-nora-accent-400 transition-all font-medium"
                                placeholder="Ej: 50688889999"
                            />
                            <p className="text-xs text-nora-gray-500 mt-1 ml-1">
                                Incluye el código de país sin el '+'. Ej: 506 para C.R.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-nora-gray-300 mb-1.5 ml-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-nora-blue-900 border border-nora-blue-700 text-nora-gray-100 rounded-xl px-4 py-3 outline-none focus:border-nora-accent-400 focus:ring-1 focus:ring-nora-accent-400 transition-all font-medium"
                                placeholder="proveedor@ejemplo.com"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-nora-blue-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 bg-nora-blue-700 hover:bg-nora-blue-600 text-nora-gray-200 font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !nombre.trim()}
                            className="flex-[2] py-3 px-4 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-bold rounded-xl shadow-lg shadow-nora-accent-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <span>{isEditing ? 'Actualizar' : 'Guardar'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
