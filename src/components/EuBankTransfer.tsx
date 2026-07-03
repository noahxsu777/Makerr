import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ImagePlus, Loader2, ArrowLeft } from "lucide-react";
import { EU_BANK_TRANSFER } from "../lib/euBankTransfer";
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

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[11px] text-white/40">{label}</span>
        <span className="block truncate font-mono text-xs text-white/80">{value}</span>
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
  );
}

export default function EuBankTransfer({
  amountUsd,
  totalUsd,
  countryName,
  deliveryLabel,
  recipient,
  onSuccess,
  onBack,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Adjunta un comprobante de la transferencia antes de continuar.");
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
    formData.append("recipientBankCode", recipient.bankCode);
    formData.append("proof", file);

    try {
      const res = await fetch("/api/eu-bank-transfer", {
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

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-center text-sm text-white/60">
          Transfiere desde tu banco europeo a esta cuenta
        </p>
        <p className="mt-1 text-center font-display text-2xl font-bold text-lime-300">
          ${totalUsd.toFixed(2)}
        </p>

        <div className="mt-4 space-y-2.5">
          <CopyRow label="Beneficiario / Bank name" value={EU_BANK_TRANSFER.bankName} />
          <CopyRow label="IBAN" value={EU_BANK_TRANSFER.iban} />
          <CopyRow label="SWIFT / BIC (routing number)" value={EU_BANK_TRANSFER.swiftBic} />
          <CopyRow label="Dirección del banco" value={EU_BANK_TRANSFER.bankAddress} />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-white/45">
          Comprobante de la transferencia
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-4 text-sm text-white/60 transition-colors hover:border-lime-400/40">
          <ImagePlus size={18} className="shrink-0 text-lime-300" />
          <span className="truncate">
            {file ? file.name : "Sube una captura confirmando el envío desde tu banco"}
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
        Verificamos manualmente cada transferencia bancaria europea — tu
        envío queda en revisión hasta confirmar que el dinero llegó a esta
        cuenta.
      </motion.p>
    </form>
  );
}
