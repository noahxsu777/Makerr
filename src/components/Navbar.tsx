import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, Send } from "lucide-react";

const links = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Formas de entrega", href: "#opciones" },
  { label: "Países", href: "#paises" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Preguntas", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
          scrolled ? "pt-3" : "pt-5"
        }`}
      >
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
          }`}
        >
          <a href="#top" className="flex items-center gap-2 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime-400 via-emerald-400 to-emerald-400 text-ink-950 shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:rotate-12">
              <Send size={18} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Luk<span className="text-gradient">ea</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#calculadora"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Iniciar sesión
            </a>
            <a
              href="#calculadora"
              className="group flex items-center gap-1.5 rounded-full bg-lime-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-all hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(200,255,77,0.5)]"
            >
              Enviar dinero
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl text-white lg:hidden"
            aria-label="Abrir menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden lg:hidden"
            >
              <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-4">
                {links.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                  </motion.a>
                ))}
                <a
                  href="#calculadora"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-lime-400 px-5 py-3 text-sm font-semibold text-ink-950"
                >
                  Enviar dinero
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
