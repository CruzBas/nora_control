'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    //Datos Quemados para el login
    if (email === 'admin@nora.com' && password === 'admin123') {
      router.push('/dashboardAdmin');
    } else if (email === 'cajero@nora.com' && password === 'cajero123') {
      router.push('/dashboardCajero');
    } else if (email === 'cocina@nora.com' && password === 'cocina123') {
      router.push('/dashboardCocina');
    } else {
      setError('Credenciales incorrectas. Intente con admin@nora.com, cajero@nora.com o cocina@nora.com');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-dvh px-4 py-8 sm:px-6 bg-nora-blue-900">
      {/* ── Card principal */}
      <div
        className="
          w-full max-w-md
          bg-nora-blue-800/40
          backdrop-blur-xl
          border border-nora-blue-700/50
          rounded-3xl
          p-6 sm:p-10
          shadow-2xl
          flex flex-col
          min-h-[520px] sm:min-h-[600px]
          relative
          overflow-hidden
          animate-in zoom-in-95 duration-500
        "
      >
        {/* Efecto decorativo de fondo */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "var(--nora-accent-500)" }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full opacity-5 pointer-events-none"
          style={{ background: "var(--nora-accent-300)" }}
          aria-hidden="true"
        />

        {/* ── Encabezado ── */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">
            NÖRA{" "}
            <span className="text-nora-accent-500">CONTROL</span>
          </h1>
          <p className="text-nora-gray-400 font-medium text-sm">
            Sistema Inteligente de Gestión
          </p>
        </div>

        {/* ── Formulario ── */}
        <form
          onSubmit={handleLogin}
          className="space-y-5 pt-4 flex-1 relative z-10"
        >
          {/* Campo: Correo */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2 ml-1"
            >
              Usuario / Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-5 py-4
                bg-nora-blue-900/60
                border border-nora-blue-700/50
                rounded-2xl
                text-white text-sm
                focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500
                outline-none
                transition-all duration-300
                placeholder:text-nora-gray-700
                hover:border-nora-blue-600
              "
              placeholder="admin@nora.com"
            />
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-nora-gray-400 uppercase tracking-widest mb-2 ml-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-5 py-4
                bg-nora-blue-900/60
                border border-nora-blue-700/50
                rounded-2xl
                text-white text-sm
                focus:ring-2 focus:ring-nora-accent-500/50 focus:border-nora-accent-500
                outline-none
                transition-all duration-300
                placeholder:text-nora-gray-700
                hover:border-nora-blue-600
              "
              placeholder="••••••••"
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="p-4 bg-nora-danger/10 border border-nora-danger/20 text-nora-danger text-xs rounded-xl text-center font-medium animate-in fade-in slide-in-from-top-1 duration-300">
              {error}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            className="
              w-full py-4 mt-6
              bg-nora-accent-500
              hover:bg-nora-accent-400
              active:bg-nora-accent-600
              text-white font-black text-sm uppercase tracking-widest
              rounded-2xl
              transition-all duration-300
              active:scale-[0.97]
              cursor-pointer
              shadow-lg shadow-nora-accent-500/20
            "
          >
            Entrar al Sistema
          </button>
        </form>

        {/* Redes o Aux de login */}
        <div className="mt-6 flex justify-center gap-4 relative z-10">
          <p className="text-[10px] text-nora-gray-500 font-bold uppercase tracking-tighter">
            admin@nora.com | cajero@nora.com | cocina@nora.com
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 text-center text-nora-gray-600 text-[10px] font-bold tracking-widest relative z-10 uppercase">
          &copy; 2026 NÖRA CONTROL CR
        </div>
      </div>
    </main>
  );
}

