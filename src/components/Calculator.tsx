import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap, ShieldCheck, Clock3, Receipt, Radio, WifiOff } from "lucide-react";
import { countries, type Country } from "../lib/data";
import { getTransferFee, MAX_SEND_USD, MIN_SEND_USD } from "../lib/fees";
import { useLiveRates } from "../lib/useLiveRates";
import AnimatedNumber from "./AnimatedNumber";
import CheckoutModal from "./CheckoutModal";

function getRate(country: Country, liveRates: Record<string, number> | null): number {
  if (country.currency === "USD") return 1;
  return liveRates?.[country.currency] ?? country.rate;
}

const deliverySpeeds = [
  { label: "Billetera móvil", time: "~2 min", icon: Zap },
  { label: "Depósito bancario", time: "mismo día", icon: Clock3 },
  { label: "Retiro en efectivo", time: "~10 min", icon: ShieldCheck },
];

export default function Calculator() {
  const [amount, setAmount] = useState(500);
  const [countryIdx, setCountryIdx] = useState(0);
  const [deliveryIdx, setDeliveryIdx] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const country = countries[countryIdx];
  const delivery = deliverySpeeds[deliveryIdx];
  const { rates: liveRates, loading: ratesLoading, error: ratesError } = useLiveRates();

  const rate = getRate(country, liveRates);
  const isLive = country.currency !== "USD" && Boolean(liveRates?.[country.currency]);

  const received = useMemo(() => amount * rate, [amount, rate]);

  const fee = getTransferFee(amount);
  const total = amount + fee;
  const canContinue = amount >= MIN_SEND_USD && amount <= MAX_SEND_USD;

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
            className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-[90px]"
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
                  min={MIN_SEND_USD}
                  max={MAX_SEND_USD}
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
                min={MIN_SEND_USD}
                max={MAX_SEND_USD}
                step={10}
                value={Math.min(amount, MAX_SEND_USD)}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-lime-400"
              />
              {!canContinue && (
                <p className="mt-3 text-xs text-lime-300/80">
                  Elige un monto entre ${MIN_SEND_USD} y ${MAX_SEND_USD.toLocaleString("en-US")} USD.
                </p>
              )}
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
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                {ratesLoading ? (
                  <span className="text-white/35">Buscando tasas en vivo…</span>
                ) : isLive ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Radio size={11} />
                    Tasa en vivo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-white/35" title={ratesError ?? undefined}>
                    <WifiOff size={11} />
                    Tasa de respaldo
                  </span>
                )}
              </div>
              {!ratesLoading && !isLive && ratesError && (
                <p className="mt-1 text-[10px] leading-tight text-white/25">
                  {ratesError}
                </p>
              )}
              <div className="relative mt-4">
                <select
                  value={countryIdx}
                  onChange={(e) => setCountryIdx(Number(e.target.value))}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-sm font-medium text-white outline-none"
                >
                  {countries.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.flag} {c.name} · tasa {getRate(c, liveRates).toLocaleString("en-US")}
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

          <div className="relative mt-6 rounded-2xl bg-white/[0.03] px-5 py-4">
            <div className="flex items-center justify-between text-sm text-white/50">
              <span>Envías</span>
              <span className="font-medium text-white">${amount.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Receipt size={14} className="text-lime-300" />
                Costo de envío
              </span>
              <span className="font-medium text-white">${fee.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-sm font-semibold text-white/70">Total a pagar</span>
              <span className="font-display text-lg font-bold text-lime-300">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/35">
              $2.99 USD en envíos hasta $1,000 · $15.00 USD en envíos hasta $2,500. Tasa: 1 USD = {rate.toLocaleString("en-US")}{" "}
              {country.name === "Ecuador" || country.name === "El Salvador"
                ? "USD"
                : "moneda local"}
            </p>
          </div>

          <p className="relative mt-6 text-xs font-semibold uppercase tracking-wide text-white/40">
            Elige forma de entrega
          </p>
          <div className="relative mt-3 grid gap-3 sm:grid-cols-3">
            {deliverySpeeds.map((d, i) => {
              const selected = i === deliveryIdx;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDeliveryIdx(i)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-lime-400/50 bg-lime-400/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      selected
                        ? "bg-lime-400/20 text-lime-300"
                        : "bg-white/5 text-emerald-400"
                    }`}
                  >
                    <d.icon size={15} />
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-white/80">
                      {d.label}
                    </div>
                    <div className="text-[11px] text-white/40">{d.time}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setCheckoutOpen(true)}
            className="relative mt-7 w-full rounded-full bg-gradient-to-r from-lime-400 via-lime-300 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            Continuar con este envío
          </button>
        </motion.div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        amountUsd={amount}
        feeUsd={fee}
        totalUsd={total}
        receivedAmount={received}
        country={country}
        deliveryLabel={delivery.label}
      />
    </section>
  );
}
