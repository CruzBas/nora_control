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

import Modal from '../common/Modal';

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
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 text-xs text-nora-danger bg-nora-danger/10 border border-nora-danger/20 rounded-xl font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-nora-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Nombre del Proveedor *
                        </label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full bg-nora-blue-900/60 border border-nora-blue-700/50 text-white rounded-2xl p-4 outline-none focus:ring-2 focus:ring-nora-accent-500 transition-all text-sm font-medium"
                            placeholder="Ej: Dos Pinos"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-nora-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            WhatsApp (Sin '+')
                        </label>
                        <input
                            type="text"
                            value={contacto}
                            onChange={(e) => setContacto(e.target.value)}
                            className="w-full bg-nora-blue-900/60 border border-nora-blue-700/50 text-white rounded-2xl p-4 outline-none focus:ring-2 focus:ring-nora-accent-500 transition-all text-sm font-medium"
                            placeholder="Ej: 50688889999"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-nora-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-nora-blue-900/60 border border-nora-blue-700/50 text-white rounded-2xl p-4 outline-none focus:ring-2 focus:ring-nora-accent-500 transition-all text-sm font-medium"
                            placeholder="proveedor@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || !nombre.trim()}
                        className="w-full py-4 bg-nora-accent-500 text-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 hover:bg-nora-accent-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                        {isSubmitting ? 'Guardando...' : <span>{isEditing ? 'Actualizar' : 'Guardar Proveedor'}</span>}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full mt-3 py-3 text-nora-gray-500 font-bold hover:text-nora-gray-300 transition-colors text-xs uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
