import { motion } from "framer-motion";
import {
  Landmark,
  Wallet,
  Store,
  CreditCard,
  Home,
  Smartphone,
  Receipt,
  Bitcoin,
  type LucideIcon,
} from "lucide-react";
import { deliveryOptions } from "../lib/data";

const icons: Record<string, LucideIcon> = {
  Landmark,
  Wallet,
  Store,
  CreditCard,
  Home,
  Smartphone,
  Receipt,
  Bitcoin,
};

const accentClasses: Record<string, string> = {
  lime: "from-lime-400/25 to-lime-400/5 text-lime-300 ring-lime-400/25",
  emerald: "from-emerald-400/25 to-emerald-400/5 text-emerald-400 ring-emerald-400/25",
  moss: "from-emerald-500/30 to-emerald-500/5 text-lime-200 ring-emerald-500/25",
  mint: "from-lime-200/20 to-lime-200/5 text-lime-200 ring-lime-200/20",
};

export default function Features() {
  return (
    <section id="opciones" className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Más opciones, siempre
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            8 formas de entregar el dinero, no solo una.
          </h2>
          <p className="mt-4 text-white/55">
            Otras apps te dejan elegir entre efectivo o banco. Nosotros te
            damos ocho caminos distintos para que tu gente reciba como
            prefiera.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryOptions.map((f, i) => {
            const Icon = icons[f.icon];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition-colors duration-300 hover:border-white/20"
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ring-1 transition-transform duration-300 group-hover:scale-110 ${
                    accentClasses[f.accent]
                  }`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {f.desc}
                </p>

                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-white/[0.03] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
