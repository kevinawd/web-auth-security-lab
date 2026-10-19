// Pie de la tarjeta. Reproduce el PATRÓN visual (filas de enlaces subrayados y
// una línea de marca), pero con identidad propia del laboratorio: no se usan
// nombres ni marcas de ningún servicio real.
const LINK = 'underline underline-offset-2 hover:text-white/80';

export default function ServiceFooter() {
  return (
    <div className="mt-12 text-center text-[11px] leading-5 text-white">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a href="#" className={LINK}>Ayuda</a>
        <a href="#" className={LINK}>Política de privacidad</a>
        <a href="#" className={LINK}>Aviso de cookies</a>
      </nav>

      <nav className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a href="#" className={LINK}>Política de uso aceptable</a>
        <a href="#" className={LINK}>Estado del sistema</a>
        <a href="#" className={LINK}>Documentación</a>
      </nav>

      {/* <div className="mt-7 flex items-center justify-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rotate-45 bg-white"
        />
        <span className="text-sm font-bold uppercase tracking-[0.18em]">
          Lab Login
        </span>
      </div>

      <p className="mt-3 text-[11px]">
        Laboratorio de autenticación web — entorno de práctica
      </p>

      <nav className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a href="#" className={LINK}>Guía del laboratorio</a>
        <a href="#" className={LINK}>Buenas prácticas</a>
        <a href="#" className={LINK}>Cómo detectar phishing</a>
      </nav> */}
    </div>
  );
}
