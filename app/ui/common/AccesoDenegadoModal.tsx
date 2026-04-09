'use client';

import { useState } from 'react';
import { crearSolicitudAction } from '@/lib/actions/solicitudes.actions';

interface AccesoDenegadoModalProps {
    isOpen: boolean;
    pagina: string;
    paginaLabel: string;
    onClose: () => void;
}

import Modal from './Modal';

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
        <Modal isOpen={isOpen} onClose={handleClose} title="Acceso Restringido">
            <div className="space-y-6">
                {enviado ? (
                    <div className="text-center py-6 space-y-4">
                        <div className="text-5xl">📨</div>
                        <h2 className="text-xl font-black text-nora-white">¡Solicitud Enviada!</h2>
                        <p className="text-nora-gray-400 text-xs px-4">
                            Tu solicitud de acceso a <strong className="text-nora-white">{paginaLabel}</strong> ha sido enviada.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-nora-blue-700/50 text-white font-bold rounded-2xl border border-nora-blue-600/50 uppercase tracking-widest text-xs"
                        >
                            Entendido
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="text-5xl mb-2">🔒</div>
                            <p className="text-nora-gray-400 text-xs">
                                No tienes permiso para acceder a{' '}
                                <strong className="text-nora-white">{paginaLabel}</strong>.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-nora-gray-500 uppercase tracking-widest mb-2 ml-1">
                                    Motivo del Acceso
                                </label>
                                <textarea
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    placeholder="Explica por qué necesitas acceso..."
                                    rows={3}
                                    className="w-full p-4 bg-nora-blue-900/60 border border-nora-blue-700/50 rounded-2xl text-white text-sm focus:ring-2 focus:ring-nora-accent-500 outline-none transition-all placeholder:text-nora-gray-600 resize-none"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-nora-danger/10 border border-nora-danger/20 text-nora-danger text-[10px] rounded-xl text-center font-black uppercase">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    onClick={handleSolicitar}
                                    disabled={enviando}
                                    className="w-full py-4 bg-nora-accent-500 text-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 uppercase tracking-widest text-sm disabled:opacity-50"
                                >
                                    {enviando ? 'Enviando...' : 'Solicitar Acceso'}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-3 py-3 text-nora-gray-500 font-bold hover:text-nora-gray-300 transition-colors text-[10px] uppercase tracking-widest"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
