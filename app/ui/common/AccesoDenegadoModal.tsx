'use client';

import { useState } from 'react';
import { crearSolicitudAction } from '@/lib/actions/solicitudes.actions';

interface AccesoDenegadoModalProps {
    isOpen: boolean;
    pagina: string;
    paginaLabel: string;
    onClose: () => void;
}

export default function AccesoDenegadoModal({
    isOpen,
    pagina,
    paginaLabel,
    onClose,
}: AccesoDenegadoModalProps) {
    const [motivo, setMotivo] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSolicitar = async () => {
        setEnviando(true);
        setError('');

        const res = await crearSolicitudAction(pagina, motivo);

        if (res.success) {
            setEnviado(true);
        } else {
            setError(res.error || 'Error al enviar solicitud');
        }
        setEnviando(false);
    };

    const handleClose = () => {
        setMotivo('');
        setEnviado(false);
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-nora-blue-800 border border-nora-blue-700/50 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                {enviado ? (
                    /* ── Estado: Solicitud enviada ── */
                    <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-nora-success/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-nora-success text-3xl">
                                check_circle
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-nora-gray-100 mb-2">
                            ¡Solicitud Enviada!
                        </h2>
                        <p className="text-nora-gray-400 text-sm">
                            Tu solicitud de acceso a <strong className="text-nora-gray-200">{paginaLabel}</strong> ha sido
                            enviada. Un administrador la revisará pronto.
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-6 px-8 py-3 bg-nora-blue-700 hover:bg-nora-blue-600 text-white font-bold rounded-2xl transition-all text-sm"
                        >
                            Entendido
                        </button>
                    </div>
                ) : (
                    /* ── Estado: Formulario de solicitud ── */
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-yellow-400 text-3xl">
                                    lock
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-nora-gray-100 mb-2">
                                Acceso Restringido
                            </h2>
                            <p className="text-nora-gray-400 text-sm">
                                No tienes permiso para acceder a{' '}
                                <strong className="text-nora-gray-200">{paginaLabel}</strong>.
                                Puedes solicitar acceso temporal a un administrador.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2">
                                    Motivo (opcional)
                                </label>
                                <textarea
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Explica por qué necesitas acceso..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-600 resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-nora-danger/10 border border-nora-danger/20 text-nora-danger text-xs rounded-xl text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 bg-nora-blue-700 hover:bg-nora-blue-600 text-nora-gray-300 font-bold rounded-2xl transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSolicitar}
                                    disabled={enviando}
                                    className="flex-1 py-3 bg-nora-accent-500 hover:bg-nora-accent-400 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-nora-accent-500/25 disabled:opacity-50"
                                >
                                    {enviando ? 'Enviando...' : 'Solicitar Acceso'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
