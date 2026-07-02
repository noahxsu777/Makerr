import { motion } from "framer-motion";
import { Apple, Play, Star, Bell, ArrowRightLeft } from "lucide-react";

export default function AppCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="animate-blob absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 bg-violet-500/15 blur-[110px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass grid items-center gap-12 overflow-hidden rounded-[2.5rem] p-8 sm:p-14 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
                Llévala contigo
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Todo tu envío, desde tu bolsillo.
              </h2>
              <p className="mt-4 max-w-md text-white/55">
                Guarda destinatarios frecuentes, activa alertas de tasa y
                repite tu último envío en un toque.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-ink-950 transition-transform hover:-translate-y-0.5"
                >
                  <Apple size={22} />
                  <div className="text-left leading-none">
                    <div className="text-[10px] text-ink-950/60">Descárgala en</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-ink-950 transition-transform hover:-translate-y-0.5"
                >
                  <Play size={20} className="fill-ink-950" />
                  <div className="text-left leading-none">
                    <div className="text-[10px] text-ink-950/60">Disponible en</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </a>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-sm text-white/50">
                <div className="flex text-lime-300">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-lime-300" />
                  ))}
                </div>
                4.9 de calificación · +120,000 reseñas
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[280px]"
          >
            <div className="animate-float relative aspect-[9/18.5] w-full overflow-hidden rounded-[2.2rem] border-4 border-white/10 bg-ink-900 shadow-2xl">
              <div className="flex h-full flex-col p-4">
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <Bell size={10} /> 2
                  </span>
                </div>

                <div className="mt-6 font-display text-lg font-bold text-white">
                  Hola, Rosa 👋
                </div>
                <div className="text-[11px] text-white/40">
                  Tu último envío llegó hace 2 días
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-br from-lime-400/20 to-violet-400/10 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-[10px] text-white/50">
                    <span>Envío rápido</span>
                    <ArrowRightLeft size={12} />
                  </div>
                  <div className="mt-2 font-display text-xl font-bold text-white">
                    🇲🇽 México
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: "78%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-lime-400 to-aqua-400"
                    />
                  </div>
                  <div className="mt-1.5 text-[10px] text-white/40">
                    En camino · llega en 2 min
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {["Nequi · $120", "OXXO · $80", "Banco BBVA · $300"].map(
                    (row) => (
                      <div
                        key={row}
                        className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-[11px] text-white/60"
                      >
                        {row}
                        <span className="text-lime-300">✓</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
