import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ExternalLink, ServerCrash } from "lucide-react";
import type { Recipient } from "./RecipientForm";

type Country = { name: string; flag: string };

export type CryptoOrderContext = {
  orderId: string;
  amountUsd: number;
  feeUsd: number;
  totalUsd: number;
  receivedAmount: number;
  countryName: string;
  countryFlag: string;
  currency: string;
  deliveryLabel: string;
  recipient: Recipient;
  promoCode?: string;
};

export const CRYPTO_ORDER_STORAGE_KEY = "lukea_crypto_order";

type Props = {
  amountUsd: number;
  totalUsd: number;
  receivedAmount: number;
  countryName: Country["name"];
  countryFlag: Country["flag"];
  currency: string;
  deliveryLabel: string;
  recipient: Recipient;
  promoCode?: string;
  onBack: () => void;
};

export default function CryptoPayment({
  amountUsd,
  totalUsd,
  receivedAmount,
  countryName,
  countryFlag,
  currency,
  deliveryLabel,
  recipient,
  promoCode,
  onBack,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/create-crypto-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountUsd,
          countryName,
          deliveryMethod: deliveryLabel,
          recipientName: recipient.fullName,
          recipientPhone: recipient.phone,
          recipientEmail: recipient.email,
          recipientReference: recipient.reference,
          recipientBank: recipient.bankName,
          recipientAccountType: recipient.accountType,
          recipientDocumentType: recipient.documentType,
          recipientDocumentNumber: recipient.documentNumber,
          recipientBankCode: recipient.bankCode,
          promoCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago con Paymento.");

      const context: CryptoOrderContext = {
        orderId: data.orderId,
        amountUsd,
        feeUsd: totalUsd - amountUsd,
        totalUsd,
        receivedAmount,
        countryName,
        countryFlag,
        currency,
        deliveryLabel,
        recipient,
        promoCode,
      };
      window.sessionStorage.setItem(CRYPTO_ORDER_STORAGE_KEY, JSON.stringify(context));
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor. ¿Está corriendo `npm run server` o `npm run dev:all`?"
          : (err as Error).message
      );
      setSubmitting(false);
    }
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

      <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-sm text-white/60">
          Vas a pagar con cripto a través de Paymento
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-lime-300">
          ${totalUsd.toFixed(2)}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-white/40">
          Te llevamos a la página segura de Paymento para elegir tu moneda y
          completar el pago. Al confirmar, vuelves aquí automáticamente.
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <ServerCrash size={16} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Abriendo Paymento…
          </>
        ) : (
          <>
            Pagar con cripto
            <ExternalLink size={16} />
          </>
        )}
      </button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-center text-xs text-white/35"
      >
        Procesado por Paymento. Confirmamos tu pago automáticamente en
        cuanto la transacción se acredita.
      </motion.p>
    </div>
  );
}
