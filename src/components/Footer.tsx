import { Link } from "react-router-dom";
import { Send, AtSign, MessageCircle, Camera, Video } from "lucide-react";

const columns = [
  {
    title: "Producto",
    links: [
      { label: "Cómo funciona", to: "/#como-funciona" },
      { label: "Formas de entrega", to: "/#opciones" },
      { label: "Tasas en vivo", to: "/#calculadora" },
      { label: "App móvil", to: "/#top" },
    ],
  },
  {
    title: "Países",
    links: [
      { label: "México", to: "/#paises" },
      { label: "Colombia", to: "/#paises" },
      { label: "Guatemala", to: "/#paises" },
      { label: "Honduras", to: "/#paises" },
      { label: "Filipinas", to: "/#paises" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Sobre nosotros", to: "/sobre-nosotros" },
      { label: "Carreras", to: "/carreras" },
      { label: "Prensa", to: "/prensa" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", to: "/#faq" },
      { label: "Contacto", to: "/prensa" },
      { label: "Estado del servicio", to: "#" },
      { label: "Seguridad", to: "/sobre-nosotros" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime-400 via-emerald-400 to-emerald-400 text-ink-950">
                <Send size={18} strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-bold text-white">
                Luk<span className="text-gradient">ea</span>
              </span>
            </Link>
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
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-white/35 sm:flex-row">
          <p>© {new Date().getFullYear()} Lukea. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60">Privacidad</a>
            <a href="#" className="hover:text-white/60">Términos</a>
            <a href="#" className="hover:text-white/60">Licencias</a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-white/40">
          Made in the US 🇺🇸 · hecho para latinos, con ❤️
        </p>
      </div>
    </footer>
  );
}
