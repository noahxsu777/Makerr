import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap, ShieldCheck, Clock3 } from "lucide-react";
import { countries } from "../lib/data";
import AnimatedNumber from "./AnimatedNumber";

const deliverySpeeds = [
  { label: "Billetera móvil", time: "~2 min", icon: Zap },
  { label: "Depósito bancario", time: "mismo día", icon: Clock3 },
  { label: "Retiro en efectivo", time: "~10 min", icon: ShieldCheck },
];

export default function Calculator() {
  const [amount, setAmount] = useState(500);
  const [countryIdx, setCountryIdx] = useState(0);
  const country = countries[countryIdx];

  const received = useMemo(
    () => amount * country.rate,
    [amount, country.rate]
  );

  return (
    <section id="calculadora" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Calcula tu envío al instante
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/55">
            Sin cuentas, sin registro. La tasa que ves es la tasa que pagas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]"
          />

          <div className="relative grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Envías
              </label>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-display text-3xl font-bold text-white/70">
                  $
                </span>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full bg-transparent font-display text-3xl font-bold text-white outline-none"
                />
                <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/50">
                  USD
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={Math.min(amount, 2000)}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-lime-400"
              />
            </div>

            <div className="rounded-2xl border border-lime-400/25 bg-lime-400/[0.05] p-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-lime-300/70">
                Recibe
              </label>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-display text-3xl font-bold text-lime-300">
                  <AnimatedNumber value={received} decimals={2} />
                </span>
              </div>
              <div className="relative mt-5">
                <select
                  value={countryIdx}
                  onChange={(e) => setCountryIdx(Number(e.target.value))}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-sm font-medium text-white outline-none"
                >
                  {countries.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.flag} {c.name} · tasa {c.rate}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                />
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Zap size={15} className="text-lime-300" />
              0% comisión de envío para este monto
            </div>
            <span className="text-sm font-semibold text-white/70">
              Tasa: 1 USD = {country.rate.toLocaleString("en-US")}{" "}
              {country.name === "Ecuador" || country.name === "El Salvador"
                ? "USD"
                : "moneda local"}
            </span>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            {deliverySpeeds.map((d) => (
              <div
                key={d.label}
                className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-aqua-400">
                  <d.icon size={15} />
                </span>
                <div>
                  <div className="text-xs font-semibold text-white/80">
                    {d.label}
                  </div>
                  <div className="text-[11px] text-white/40">{d.time}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="relative mt-7 w-full rounded-full bg-gradient-to-r from-lime-400 via-lime-300 to-aqua-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99]">
            Continuar con este envío
          </button>
        </motion.div>
      </div>
    </section>
  );
}
