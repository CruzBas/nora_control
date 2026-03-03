'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
    show: boolean;
    message: string;
}

export default function Toast({ show, message }: ToastProps) {
    if (!show) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-nora-blue-800 text-nora-white px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-nora-accent-500/30 flex items-center space-x-3 z-[110] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-nora-accent-500 rounded-full p-1">
                <CheckCircleIcon className="h-6 w-6 text-nora-white" />
            </div>
            <span className="font-black uppercase tracking-tight text-sm">{message}</span>
        </div>
    );
}
