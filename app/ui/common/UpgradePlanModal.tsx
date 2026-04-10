'use client';

import Modal from './Modal';

interface UpgradePlanModalProps {
    isOpen: boolean;
    paginaLabel: string;
    onClose: () => void;
}

export default function UpgradePlanModal({
    isOpen,
    paginaLabel,
    onClose,
}: UpgradePlanModalProps) {
    const adminEmail = 'admin.tools@noratechgroup.com';
    const subject = encodeURIComponent(`Solicitud de Mejora de Plan: Módulo ${paginaLabel}`);
    const body = encodeURIComponent(`Hola,\n\nMe gustaría solicitar una mejora de plan para mi organización para poder acceder al módulo de ${paginaLabel}.\n\nSaludos.`);
    
    const mailtoUrl = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Plan Superior Requerido">
            <div className="space-y-6 py-4">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-nora-accent-500/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-nora-accent-400 text-4xl">
                            rocket_launch
                        </span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-nora-white uppercase tracking-tight">
                            Potencia tu Negocio
                        </h3>
                        <p className="text-nora-gray-400 text-sm px-4">
                            El módulo de <strong className="text-nora-accent-400">{paginaLabel}</strong> no está disponible en tu plan actual.
                        </p>
                    </div>
                </div>

                <div className="bg-nora-blue-900/40 border border-nora-blue-700/50 rounded-2xl p-6 text-center space-y-4">
                    <p className="text-nora-gray-300 text-xs leading-relaxed">
                        Para acceder a esta y otras funciones avanzadas, solicita una consultoría y mejora tu plan con nuestro equipo técnico.
                    </p>
                    
                    <a
                        href={mailtoUrl}
                        className="inline-flex items-center justify-center w-full py-4 bg-nora-accent-500 text-white font-black rounded-2xl shadow-lg shadow-nora-accent-500/20 uppercase tracking-widest text-xs hover:bg-nora-accent-400 transition-all gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        Solicitar Mejora de Plan
                    </a>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2 text-nora-gray-500 font-bold hover:text-nora-gray-300 transition-colors text-[10px] uppercase tracking-widest"
                >
                    Volver
                </button>
            </div>
        </Modal>
    );
}
