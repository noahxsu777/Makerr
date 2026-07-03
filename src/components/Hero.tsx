import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { stats } from "../lib/data";
import Counter from "./Counter";

export default function Hero() {
  return (
    <section
      id="top"
      className="noise-bg relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32"
    >
      {/* Ambient blobs */}
      <div
        aria-hidden
        className="animate-blob absolute -top-32 -left-32 h-[26rem] w-[26rem] bg-emerald-500/25 blur-[100px]"
      />
      <div
        aria-hidden
        className="animate-blob absolute top-40 -right-20 h-[24rem] w-[24rem] bg-lime-400/20 blur-[110px]"
        style={{ animationDelay: "-4s" }}
      />
      <div
        aria-hidden
        className="animate-blob absolute bottom-0 left-1/3 h-[20rem] w-[20rem] bg-emerald-400/15 blur-[100px]"
        style={{ animationDelay: "-8s" }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-lime-300"
          >
            <Zap size={13} className="fill-lime-300" />
            Tasas en vivo, actualizadas cada minuto
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4rem]"
          >
            Envía dinero
            <br />
            <span className="text-gradient">más rápido, más fácil,</span>
            <br />
            con más opciones.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/60"
          >
            Una remesadora con mejor diseño, mejores tasas y 8 formas de
            entrega en 21 países. Sin comisiones escondidas, sin filas, sin
            estrés.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              href="#calculadora"
              className="group flex items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-4 text-base font-semibold text-ink-950 shadow-[0_8px_32px_-8px_rgba(200,255,77,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-6px_rgba(200,255,77,0.7)]"
            >
              Calcula tu envío
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <a
              href="#opciones"
              className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 text-base font-semibold text-white/90 transition-colors hover:bg-white/5"
            >
              Ver formas de entrega
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-14 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <div className="whitespace-nowrap font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs leading-tight text-white/45">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="animate-float">
            <div className="glass relative overflow-hidden rounded-[2rem] p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/50">
                  Envías a
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-300">
                  <CheckCircle2 size={12} /> Verificado
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                <span className="text-3xl">🇲🇽</span>
                <div>
                  <div className="font-display text-lg font-semibold text-white">
                    México
                  </div>
                  <div className="text-xs text-white/45">
                    Llega por OXXO en ~4 min
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3.5">
                  <span className="text-sm text-white/50">Envías</span>
                  <span className="font-display text-lg font-semibold text-white">
                    $500.00
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-lime-400/30 bg-lime-400/5 px-4 py-3.5">
                  <span className="text-sm text-lime-300/80">Recibe</span>
                  <span className="font-display text-lg font-semibold text-lime-300">
                    $9,210.00 MXN
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-emerald-400" />
                  Tasa 18.42 · Envío desde $2.99
                </span>
                <ShieldCheck size={14} className="text-white/30" />
              </div>

              <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-lime-400 via-lime-300 to-emerald-400 py-3.5 text-sm font-bold text-ink-950 transition-transform hover:scale-[1.02]">
                Confirmar envío
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="glass absolute -left-8 top-8 hidden items-center gap-2 rounded-2xl px-4 py-3 shadow-lg sm:flex"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/20 text-emerald-400">
                <CheckCircle2 size={16} />
              </span>
              <div className="text-xs">
                <div className="font-semibold text-white">Rosa recibió $9,210</div>
                <div className="text-white/40">hace 12 segundos</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="glass absolute -right-10 -bottom-10 hidden rounded-2xl px-4 py-3 shadow-lg sm:block"
            >
              <div className="text-xs font-semibold text-lime-300">
                +30 wallets locales
              </div>
              <div className="text-[11px] text-white/40">Nequi · Yape · DaviPlata</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
