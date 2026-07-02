import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import {
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ServerCrash,
} from "lucide-react";
import { isStripeConfigured, stripePromise } from "../lib/stripe";

type Country = { name: string; flag: string };

type Props = {
  open: boolean;
  onClose: () => void;
  amountUsd: number;
  receivedAmount: number;
  country: Country;
  deliveryLabel: string;
};

const appearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#b6ff2e",
    colorBackground: "#0a0d0a",
    colorText: "#ffffff",
    colorTextSecondary: "#9ca39a",
    colorDanger: "#ff6161",
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Tab": {
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.03)",
    },
    ".Tab--selected": {
      border: "1px solid rgba(182,255,46,0.5)",
      backgroundColor: "rgba(182,255,46,0.06)",
    },
    ".Input": {
      border: "1px solid rgba(255,255,255,0.12)",
      backgroundColor: "rgba(255,255,255,0.03)",
    },
  },
};

function PaymentForm({
  amountLabel,
  onSuccess,
}: {
  amountLabel: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment(
      {
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      }
    );

    if (confirmError) {
      setError(confirmError.message ?? "No se pudo procesar el pago.");
      setSubmitting(false);
      return;
    }

    if (
      paymentIntent?.status === "succeeded" ||
      paymentIntent?.status === "processing"
    ) {
      onSuccess();
    } else {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Procesando…
          </>
        ) : (
          `Pagar ${amountLabel}`
        )}
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/35">
        <ShieldCheck size={13} />
        Pagos procesados de forma segura por Stripe
      </p>
    </form>
  );
}

export default function CheckoutModal({
  open,
  onClose,
  amountUsd,
  receivedAmount,
  country,
  deliveryLabel,
}: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "success">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setStatus("idle");
      setError(null);
      return;
    }

    if (!isStripeConfigured) return;

    setStatus("loading");
    setError(null);

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountUsd,
        countryName: country.name,
        deliveryMethod: deliveryLabel,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago.");
        setClientSecret(data.clientSecret);
        setStatus("ready");
      })
      .catch((e: Error) => {
        setError(
          e.message ||
            "No se pudo conectar con el servidor de pagos. Corre `npm run dev:all`."
        );
        setStatus("idle");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const options: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance }
    : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] p-6 sm:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>

            {status !== "success" && (
              <>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
                  Confirmar envío
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">
                  Paga con tarjeta o cuenta bancaria
                </h3>

                <div className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Envías</span>
                    <span className="font-semibold text-white">
                      ${amountUsd.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Recibe en {country.flag} {country.name}</span>
                    <span className="font-semibold text-lime-300">
                      {receivedAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Forma de entrega</span>
                    <span className="font-medium text-white/80">
                      {deliveryLabel}
                    </span>
                  </div>
                </div>
              </>
            )}

            {!isStripeConfigured && status !== "success" && (
              <div className="mt-6 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-5 text-sm leading-relaxed text-white/70">
                <p className="font-semibold text-lime-300">
                  Stripe todavía no está configurado
                </p>
                <p className="mt-2">
                  Para aceptar pagos reales, agrega tu clave publicable de
                  Stripe en{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    VITE_STRIPE_PUBLISHABLE_KEY
                  </code>{" "}
                  y tu clave secreta en{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    STRIPE_SECRET_KEY
                  </code>{" "}
                  dentro de tu archivo <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env</code>.
                </p>
              </div>
            )}

            {isStripeConfigured && status === "loading" && (
              <div className="mt-10 flex flex-col items-center justify-center gap-3 py-8 text-white/50">
                <Loader2 size={28} className="animate-spin text-lime-300" />
                Preparando tu pago…
              </div>
            )}

            {isStripeConfigured && error && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
                <ServerCrash size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {isStripeConfigured && options && status === "ready" && stripePromise && (
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                  amountLabel={`$${amountUsd.toFixed(2)}`}
                  onSuccess={() => setStatus("success")}
                />
              </Elements>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-lime-400/15 text-lime-300"
                >
                  <CheckCircle2 size={32} />
                </motion.span>
                <h3 className="mt-5 font-display text-2xl font-bold text-white">
                  ¡Envío en camino!
                </h3>
                <p className="mt-2 max-w-xs text-sm text-white/55">
                  {country.flag} {country.name} recibirá{" "}
                  {receivedAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  vía {deliveryLabel.toLowerCase()}.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
                >
                  Listo
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
