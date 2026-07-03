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
  Clock3,
  ShieldCheck,
  ServerCrash,
  ArrowLeft,
  Check,
  CreditCard,
  Coins,
  FlaskConical,
  Sparkles,
  Landmark,
} from "lucide-react";
import { isStripeConfigured, stripePromise } from "../lib/stripe";
import { createInvoice, type Invoice } from "../lib/invoice";
import RecipientForm, { type Recipient } from "./RecipientForm";
import CryptoPayment from "./CryptoPayment";
import EuBankTransfer from "./EuBankTransfer";
import InvoiceCard from "./InvoiceCard";

type Country = { name: string; flag: string; currency: string };

type Props = {
  open: boolean;
  onClose: () => void;
  amountUsd: number;
  feeUsd: number;
  totalUsd: number;
  receivedAmount: number;
  country: Country;
  deliveryLabel: string;
  promoCode?: string;
  // Presentes cuando el usuario vuelve del checkout hospedado de Paymento
  // (ver Calculator.tsx): la navegación completa a Paymento y de vuelta
  // destruye el estado de este modal, así que se reconstruye desde acá.
  // Paymento no distingue éxito de cancelación en su única returnUrl, así
  // que siempre se resume hacia "confirming" y el polling decide el resto.
  resumeOrderId?: string;
  resumeRecipient?: Recipient;
};

type Step = "recipient" | "ready" | "confirming" | "success";
type PaymentMethod = "stripe" | "crypto" | "eu_bank" | "test";
type SuccessInfo = {
  kind: "paid" | "pending" | "test";
  reference?: string;
};

const emptyRecipient: Recipient = {
  fullName: "",
  phone: "",
  email: "",
  reference: "",
  bankName: "",
  accountType: "",
  documentType: "",
  documentNumber: "",
  bankCode: "",
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

function StepIndicator({ step }: { step: Step }) {
  const activeIdx = step === "recipient" ? 0 : step === "success" ? 2 : 1;
  const labels = ["Destinatario", "Pago", "Listo"];

  return (
    <div className="mb-6 flex items-center gap-2">
      {labels.map((label, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-colors ${
                  done
                    ? "bg-lime-400 text-ink-950"
                    : active
                      ? "bg-lime-400/20 text-lime-300 ring-1 ring-lime-400/50"
                      : "bg-white/5 text-white/30"
                }`}
              >
                {done ? <Check size={12} /> : i + 1}
              </span>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  active || done ? "text-white/80" : "text-white/30"
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`h-px flex-1 ${done ? "bg-lime-400/60" : "bg-white/10"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MethodTabs({
  method,
  onChange,
}: {
  method: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  const tabs: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
    { id: "stripe", label: "Tarjeta o banco", icon: CreditCard },
    { id: "crypto", label: "Cripto (Paymento)", icon: Coins },
    { id: "eu_bank", label: "Banco (Europa)", icon: Landmark },
    { id: "test", label: "Prueba", icon: FlaskConical },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {tabs.map((tab) => {
        const active = method === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-colors sm:text-sm ${
              active
                ? "border-lime-400/50 bg-lime-400/10 text-lime-300"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
            }`}
          >
            <tab.icon size={15} className="shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PaymentForm({
  amountLabel,
  onSuccess,
  onBack,
}: {
  amountLabel: string;
  onSuccess: () => void;
  onBack: () => void;
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
    <form onSubmit={handleSubmit} className="mt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-xs font-medium text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft size={13} />
        Editar destinatario
      </button>

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

function TestPaymentPanel({
  amountLabel,
  onSuccess,
  onBack,
}: {
  amountLabel: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = () => {
    setSubmitting(true);
    setTimeout(onSuccess, 900);
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-xs font-medium text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft size={13} />
        Editar destinatario
      </button>

      <div className="flex flex-col items-center rounded-2xl border border-lime-400/20 bg-lime-400/5 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-lime-400/15 text-lime-300">
          <Sparkles size={22} />
        </span>
        <p className="mt-3 font-semibold text-lime-300">Modo de prueba</p>
        <p className="mt-1 text-sm leading-relaxed text-white/60">
          No se hace ningún cargo real ni se contacta a Stripe o Paymento.
          Sirve para probar el flujo completo del checkout de punta a punta.
        </p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Simulando pago…
          </>
        ) : (
          `Simular pago de ${amountLabel}`
        )}
      </button>
    </div>
  );
}

export default function CheckoutModal({
  open,
  onClose,
  amountUsd,
  feeUsd,
  totalUsd,
  receivedAmount,
  country,
  deliveryLabel,
  promoCode,
  resumeOrderId,
  resumeRecipient,
}: Props) {
  const [step, setStep] = useState<Step>("recipient");
  const [method, setMethod] = useState<PaymentMethod>("stripe");
  const [recipient, setRecipient] = useState<Recipient>(emptyRecipient);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [cryptoFailed, setCryptoFailed] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("recipient");
      setMethod("stripe");
      setRecipient(emptyRecipient);
      setClientSecret(null);
      setStripeLoading(false);
      setStripeError(null);
      setSuccessInfo(null);
      setInvoice(null);
      setInvoiceLoading(false);
      setInvoiceError(null);
      setCryptoFailed(false);
      return;
    }
    if (resumeOrderId) {
      setMethod("crypto");
      setRecipient(resumeRecipient ?? emptyRecipient);
      setStep("confirming");
    }
    // resumeOrderId/resumeRecipient solo importan en el instante en que
    // `open` pasa a true — Calculator ya limpió la URL y el sessionStorage
    // para entonces, así que no hace falta re-ejecutar esto en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Mientras esperamos la confirmación de Paymento: consulta el estado del
  // pedido cada pocos segundos (no hay webhooks del navegador al cliente).
  useEffect(() => {
    if (step !== "confirming" || !resumeOrderId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/order-status/${resumeOrderId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.status === "paid") {
          setSuccessInfo({ kind: "paid" });
          setStep("success");
          generateInvoice(recipient, "Cripto (Paymento)", resumeOrderId);
        } else if (data.status === "failed") {
          setCryptoFailed(true);
          setMethod("crypto");
          setStep("ready");
        }
      } catch {
        // Falla de red puntual: se reintenta en el próximo tick del interval.
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, resumeOrderId]);

  const generateInvoice = (
    recipientData: Recipient,
    paymentMethodLabel: string,
    orderReference: string
  ) => {
    setInvoiceLoading(true);
    setInvoiceError(null);

    // Se genera enteramente en el navegador (no hay proveedor de
    // facturación real conectado), así que no depende de que el backend
    // esté corriendo. El pequeño delay es solo para que se sienta como un
    // paso real de "generando factura…".
    setTimeout(() => {
      try {
        const inv = createInvoice({
          amount: amountUsd,
          fee: feeUsd,
          total: totalUsd,
          countryName: country.name,
          deliveryMethod: deliveryLabel,
          paymentMethod: paymentMethodLabel,
          recipientName: recipientData.fullName,
          recipientReference: recipientData.reference,
          orderReference,
          promoCode,
        });
        setInvoice(inv);
      } catch (e) {
        setInvoiceError((e as Error).message || "No se pudo generar la factura.");
      } finally {
        setInvoiceLoading(false);
      }
    }, 600);
  };

  const loadStripeIntent = (recipientData: Recipient) => {
    if (!isStripeConfigured || stripeLoading) return;

    setStripeLoading(true);
    setStripeError(null);

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountUsd,
        countryName: country.name,
        deliveryMethod: deliveryLabel,
        recipientName: recipientData.fullName,
        recipientPhone: recipientData.phone,
        recipientEmail: recipientData.email,
        recipientReference: recipientData.reference,
        recipientBank: recipientData.bankName,
        recipientAccountType: recipientData.accountType,
        recipientDocumentType: recipientData.documentType,
        recipientDocumentNumber: recipientData.documentNumber,
        recipientBankCode: recipientData.bankCode,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago.");
        setClientSecret(data.clientSecret);
      })
      .catch((e: Error) => {
        setStripeError(
          e.message ||
            "No se pudo conectar con el servidor de pagos. Corre `npm run dev:all`."
        );
      })
      .finally(() => setStripeLoading(false));
  };

  const handleRecipientSubmit = (recipientData: Recipient) => {
    setRecipient(recipientData);
    setStep("ready");
    if (method === "stripe") loadStripeIntent(recipientData);
  };

  const handleMethodChange = (next: PaymentMethod) => {
    setMethod(next);
    if (next === "stripe" && !clientSecret && !stripeError && !stripeLoading) {
      loadStripeIntent(recipient);
    }
  };

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

            <StepIndicator step={step} />

            {step !== "success" && (
              <div className="mb-2 space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Envías</span>
                  <span className="font-semibold text-white">
                    ${amountUsd.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Costo de envío</span>
                  <span className="font-semibold text-white">
                    ${feeUsd.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-sm">
                  <span className="font-medium text-white/70">Total a pagar</span>
                  <span className="font-display text-base font-bold text-lime-300">
                    ${totalUsd.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">
                    Recibe en {country.flag} {country.name}
                  </span>
                  <span className="font-semibold text-lime-300">
                    {receivedAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Forma de entrega</span>
                  <span className="font-medium text-white/80">{deliveryLabel}</span>
                </div>
                {promoCode && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Código promocional</span>
                    <span className="font-medium text-lime-300">{promoCode}</span>
                  </div>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "recipient" && (
                <motion.div
                  key="recipient"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="mt-4 font-display text-xl font-bold text-white">
                    ¿Quién recibe el dinero?
                  </h3>
                  <RecipientForm
                    countryName={country.name}
                    currency={country.currency}
                    deliveryLabel={deliveryLabel}
                    initialValues={recipient}
                    onSubmit={handleRecipientSubmit}
                  />
                </motion.div>
              )}

              {step === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="mt-4 font-display text-xl font-bold text-white">
                    Elige cómo pagar
                  </h3>

                  <MethodTabs method={method} onChange={handleMethodChange} />

                  {method === "stripe" && (
                    <>
                      {!isStripeConfigured && (
                        <div className="mt-4 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-5 text-sm leading-relaxed text-white/70">
                          <p className="font-semibold text-lime-300">
                            Stripe todavía no está configurado
                          </p>
                          <p className="mt-2">
                            Para aceptar pagos reales, agrega tu clave publicable
                            de Stripe en{" "}
                            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                              VITE_STRIPE_PUBLISHABLE_KEY
                            </code>{" "}
                            y tu clave secreta en{" "}
                            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                              STRIPE_SECRET_KEY
                            </code>{" "}
                            dentro de tu archivo{" "}
                            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                              .env
                            </code>
                            .
                          </p>
                        </div>
                      )}

                      {isStripeConfigured && stripeLoading && (
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 py-8 text-white/50">
                          <Loader2 size={28} className="animate-spin text-lime-300" />
                          Preparando tu pago…
                        </div>
                      )}

                      {isStripeConfigured && stripeError && !stripeLoading && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
                            <ServerCrash size={18} className="mt-0.5 shrink-0" />
                            <p>{stripeError}</p>
                          </div>
                          <button
                            onClick={() => loadStripeIntent(recipient)}
                            className="text-xs font-semibold text-lime-300 hover:text-lime-200"
                          >
                            Reintentar
                          </button>
                        </div>
                      )}

                      {isStripeConfigured &&
                        !stripeLoading &&
                        !stripeError &&
                        options &&
                        stripePromise && (
                          <Elements stripe={stripePromise} options={options}>
                            <PaymentForm
                              amountLabel={`$${totalUsd.toFixed(2)}`}
                              onSuccess={() => {
                                setSuccessInfo({ kind: "paid" });
                                setStep("success");
                                generateInvoice(
                                  recipient,
                                  "Tarjeta o cuenta bancaria (Stripe)",
                                  clientSecret?.split("_secret_")[0] ?? crypto.randomUUID()
                                );
                              }}
                              onBack={() => setStep("recipient")}
                            />
                          </Elements>
                        )}
                    </>
                  )}

                  {method === "crypto" && (
                    <>
                      {cryptoFailed && (
                        <div className="mt-4 rounded-xl border border-lime-400/20 bg-lime-400/5 px-4 py-3 text-sm text-white/70">
                          Paymento no pudo confirmar el pago. Intenta de nuevo o elige otro método.
                        </div>
                      )}
                      <CryptoPayment
                        amountUsd={amountUsd}
                        totalUsd={totalUsd}
                        receivedAmount={receivedAmount}
                        countryName={country.name}
                        countryFlag={country.flag}
                        currency={country.currency}
                        deliveryLabel={deliveryLabel}
                        recipient={recipient}
                        promoCode={promoCode}
                        onBack={() => setStep("recipient")}
                      />
                    </>
                  )}

                  {method === "eu_bank" && (
                    <EuBankTransfer
                      amountUsd={amountUsd}
                      totalUsd={totalUsd}
                      countryName={country.name}
                      deliveryLabel={deliveryLabel}
                      recipient={recipient}
                      onBack={() => setStep("recipient")}
                      onSuccess={(reference) => {
                        setSuccessInfo({ kind: "pending", reference });
                        setStep("success");
                        generateInvoice(recipient, "Transferencia bancaria (Europa)", reference);
                      }}
                    />
                  )}

                  {method === "test" && (
                    <TestPaymentPanel
                      amountLabel={`$${totalUsd.toFixed(2)}`}
                      onBack={() => setStep("recipient")}
                      onSuccess={() => {
                        setSuccessInfo({ kind: "test" });
                        setStep("success");
                        generateInvoice(recipient, "Modo de prueba", crypto.randomUUID());
                      }}
                    />
                  )}
                </motion.div>
              )}

              {step === "confirming" && (
                <motion.div
                  key="confirming"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center gap-3 py-10 text-center"
                >
                  <Loader2 size={28} className="animate-spin text-lime-300" />
                  <p className="font-display text-lg font-semibold text-white">
                    Confirmando tu pago con Paymento…
                  </p>
                  <p className="max-w-xs text-sm text-white/50">
                    Esto puede tardar un momento mientras se acredita la
                    transacción. No cierres esta ventana.
                  </p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                    className={`grid h-16 w-16 place-items-center rounded-full ${
                      successInfo?.kind === "pending"
                        ? "bg-emerald-400/15 text-emerald-400"
                        : successInfo?.kind === "test"
                          ? "bg-white/10 text-white/70"
                          : "bg-lime-400/15 text-lime-300"
                    }`}
                  >
                    {successInfo?.kind === "pending" ? (
                      <Clock3 size={32} />
                    ) : successInfo?.kind === "test" ? (
                      <FlaskConical size={32} />
                    ) : (
                      <CheckCircle2 size={32} />
                    )}
                  </motion.span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-white">
                    {successInfo?.kind === "pending"
                      ? "Comprobante recibido"
                      : successInfo?.kind === "test"
                        ? "Simulación completada"
                        : "¡Envío en camino!"}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-white/55">
                    {successInfo?.kind === "test" ? (
                      <>
                        Este fue un envío de prueba: no se procesó ningún
                        cargo real ni se contactó a Stripe o Paymento. El
                        resto del flujo (destinatario, tasas, comisión)
                        funcionó igual que en un envío de verdad.
                      </>
                    ) : successInfo?.kind === "pending" ? (
                      <>
                        Estamos verificando tu transferencia bancaria
                        europea. Apenas se confirme el ingreso a la cuenta,{" "}
                        {recipient.fullName ||
                          "tu destinatario"} en {country.flag} {country.name}{" "}
                        recibirá{" "}
                        {receivedAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        vía {deliveryLabel.toLowerCase()}.
                      </>
                    ) : (
                      <>
                        {recipient.fullName || "Tu destinatario"} en {country.flag}{" "}
                        {country.name} recibirá{" "}
                        {receivedAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        vía {deliveryLabel.toLowerCase()}.
                      </>
                    )}
                  </p>
                  {successInfo?.kind === "pending" && successInfo.reference && (
                    <p className="mt-2 text-xs text-white/30">
                      Referencia: {successInfo.reference}
                    </p>
                  )}

                  <InvoiceCard
                    invoice={invoice}
                    loading={invoiceLoading}
                    error={invoiceError}
                    receivedLabel={receivedAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  />

                  <button
                    onClick={onClose}
                    className="mt-6 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
                  >
                    Listo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
