import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ImagePlus, Loader2, ArrowLeft } from "lucide-react";
import {
  buildSolanaPayUrl,
  isSolanaPayConfigured,
  solanaReceiveAddress,
} from "../lib/solanaPay";
import type { Recipient } from "./RecipientForm";

type Country = { name: string; flag: string };

type Props = {
  amountUsd: number;
  totalUsd: number;
  countryName: Country["name"];
  deliveryLabel: string;
  recipient: Recipient;
  onSuccess: (reference: string) => void;
  onBack: () => void;
};

export default function CryptoPayment({
  amountUsd,
  totalUsd,
  countryName,
  deliveryLabel,
  recipient,
  onSuccess,
  onBack,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSolanaPayConfigured) {
    return (
      <div className="mt-4 rounded-2xl border border-lime-400/20 bg-lime-400/5 p-5 text-sm leading-relaxed text-white/70">
        <p className="font-semibold text-lime-300">
          El pago con USDC todavía no está configurado
        </p>
        <p className="mt-2">
          Agrega la wallet de Solana que va a recibir los fondos en{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
            VITE_SOLANA_USDC_ADDRESS
          </code>{" "}
          dentro de tu archivo{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env</code>.
        </p>
        <button
          onClick={onBack}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white"
        >
          <ArrowLeft size={13} />
          Volver
        </button>
      </div>
    );
  }

  const payUrl = buildSolanaPayUrl({
    amountUsd: totalUsd,
    message: `Envío a ${recipient.fullName || "destinatario"}`,
  });

  const copyAddress = async () => {
    await navigator.clipboard.writeText(solanaReceiveAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Adjunta una captura del pago antes de continuar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("amount", String(amountUsd));
    formData.append("countryName", countryName);
    formData.append("deliveryMethod", deliveryLabel);
    formData.append("recipientName", recipient.fullName);
    formData.append("recipientPhone", recipient.phone);
    formData.append("recipientEmail", recipient.email);
    formData.append("recipientReference", recipient.reference);
    formData.append("recipientBank", recipient.bankName);
    formData.append("recipientAccountType", recipient.accountType);
    formData.append("recipientDocumentType", recipient.documentType);
    formData.append("recipientDocumentNumber", recipient.documentNumber);
    formData.append("proof", file);

    try {
      const res = await fetch("/api/crypto-payment", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar el comprobante.");
      onSuccess(data.reference as string);
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
    <form onSubmit={handleSubmit} className="mt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-xs font-medium text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft size={13} />
        Editar destinatario
      </button>

      <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="rounded-2xl bg-white p-3">
          <QRCodeSVG value={payUrl} size={168} bgColor="#ffffff" fgColor="#0a0d0a" />
        </div>
        <p className="mt-4 text-center text-sm text-white/60">
          Escanea con tu wallet de Solana para enviar
        </p>
        <p className="font-display text-2xl font-bold text-lime-300">
          {totalUsd.toFixed(2)} USDC
        </p>

        <button
          type="button"
          onClick={copyAddress}
          className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left"
        >
          <span className="truncate font-mono text-xs text-white/70">
            {solanaReceiveAddress}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-lime-300">
            {copied ? (
              <>
                <Check size={13} /> Copiado
              </>
            ) : (
              <>
                <Copy size={13} /> Copiar
              </>
            )}
          </span>
        </button>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-white/45">
          Captura del pago (comprobante)
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-4 text-sm text-white/60 transition-colors hover:border-lime-400/40">
          <ImagePlus size={18} className="shrink-0 text-lime-300" />
          <span className="truncate">
            {file ? file.name : "Sube una captura de tu wallet confirmando el envío"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Enviando comprobante…
          </>
        ) : (
          "Completar transferencia"
        )}
      </button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-center text-xs text-white/35"
      >
        Verificamos manualmente cada pago en USDC — tu envío queda en
        revisión hasta confirmar la transacción en la red Solana.
      </motion.p>
    </form>
  );
}
