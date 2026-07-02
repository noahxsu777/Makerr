import { Send, AtSign, MessageCircle, Camera, Video } from "lucide-react";

const columns = [
  {
    title: "Producto",
    links: ["Cómo funciona", "Formas de entrega", "Tasas en vivo", "App móvil"],
  },
  {
    title: "Países",
    links: ["México", "Colombia", "Guatemala", "Honduras", "Filipinas"],
  },
  {
    title: "Compañía",
    links: ["Sobre nosotros", "Carreras", "Prensa", "Blog"],
  },
  {
    title: "Soporte",
    links: ["Centro de ayuda", "Contacto", "Estado del servicio", "Seguridad"],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime-400 via-violet-400 to-aqua-400 text-ink-950">
                <Send size={18} strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-bold text-white">
                Manda<span className="text-gradient">Más</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Remesas con mejor diseño, más opciones de entrega y las tasas
              más transparentes del mercado.
            </p>
            <div className="mt-6 flex gap-3">
              {[Camera, MessageCircle, AtSign, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-white/40">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-white/35 sm:flex-row">
          <p>© {new Date().getFullYear()} MandaMás. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60">Privacidad</a>
            <a href="#" className="hover:text-white/60">Términos</a>
            <a href="#" className="hover:text-white/60">Licencias</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
