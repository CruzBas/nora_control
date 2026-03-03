export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-dvh px-4 py-8 sm:px-6">
      {/* ── Card principal — responsive ── */}
      <div
        className="
          w-full max-w-md
          bg-nora-blue-700
          rounded-2xl sm:rounded-3xl
          p-6 sm:p-10
          shadow-lg
          flex flex-col
          min-h-[520px] sm:min-h-[600px]
          relative
          overflow-hidden
        "
        style={{ boxShadow: "var(--nora-shadow-lg)" }}
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
        <div className="text-center mb-8 sm:mb-10 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            NÖRA{" "}
            <span className="text-nora-accent-500">CONTROL</span>
          </h1>
          <p className="text-nora-gray-400 font-medium text-sm sm:text-base">
            Gestiona tu negocio con elegancia
          </p>
        </div>

        {/* ── Formulario ── */}
        <form
          id="loginForm"
          className="space-y-5 sm:space-y-6 pt-4 sm:pt-6 flex-1 relative z-10"
        >
          {/* Campo: Correo */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-nora-gray-300 mb-2"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              required
              className="
                w-full px-4 py-3
                bg-nora-blue-800
                border border-white/10
                rounded-xl
                text-white text-sm sm:text-base
                focus:ring-2 focus:ring-nora-accent-500 focus:border-transparent
                outline-none
                transition-all duration-200
                placeholder:text-nora-gray-500
                hover:border-white/20
              "
              placeholder="ejemplo@negocio.com"
            />
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-nora-gray-300 mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              required
              className="
                w-full px-4 py-3
                bg-nora-blue-800
                border border-white/10
                rounded-xl
                text-white text-sm sm:text-base
                focus:ring-2 focus:ring-nora-accent-500 focus:border-transparent
                outline-none
                transition-all duration-200
                placeholder:text-nora-gray-500
                hover:border-white/20
                focus:border-nora-accent-500
              "
              placeholder="••••••••"
            />
          </div>

          {/* Mensaje de error */}
          <div
            id="errorMessage"
            className="hidden p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center"
          />

          {/* Botón de envío */}
          <button
            type="submit"
            id="submitBtn"
            className="
              w-full py-3 mt-6 sm:mt-8
              bg-nora-accent-500
              hover:bg-nora-accent-400
              active:bg-nora-accent-600
              text-white font-bold text-sm sm:text-base
              rounded-xl
              transition-all duration-200
              active:scale-[0.98]
              cursor-pointer
            "
            style={{ boxShadow: "var(--nora-shadow-accent)" }}
          >
            Entrar al Sistema
          </button>
        </form>

        {/* ── Footer ── */}
        <div className="mt-8 sm:mt-10 text-center text-nora-gray-500 text-xs relative z-10">
          &copy; 2026 NÖRA CONTROL CR
        </div>
      </div>
    </main>
  );
}
