import { motion } from "framer-motion";
import { steps } from "../lib/data";

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            Cómo funciona
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Cuatro pasos. Cero complicaciones.
          </h2>
        </motion.div>

        <div className="relative mt-16 grid gap-6 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: "easeOut" }}
              className="group relative"
            >
              <div className="glass relative h-full rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400/20 to-emerald-400/20 font-display text-lg font-bold text-lime-300 ring-1 ring-white/10">
                  {s.n}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
