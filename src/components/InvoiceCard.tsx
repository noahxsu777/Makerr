import { motion } from "framer-motion";
import { Loader2, ReceiptText, Send } from "lucide-react";
import type { Invoice } from "../lib/invoice";

type Props = {
  invoice: Invoice | null;
  loading: boolean;
  error: string | null;
  receivedLabel: string;
};

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={`text-xs ${strong ? "text-white/70" : "text-white/40"}`}>
        {label}
      </span>
      <span
        className={`truncate text-right text-xs ${
          strong ? "font-display text-sm font-bold text-lime-300" : "font-medium text-white/80"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function InvoiceCard({
  invoice,
  loading,
  error,
  receivedLabel,
}: Props) {
  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
        <Loader2 size={13} className="animate-spin" />
        Generando factura…
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-6 text-center text-xs text-white/30">
        No se pudo generar la factura ({error}). Tu envío igual se registró.
      </p>
    );
  }

  if (!invoice) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-400/15 text-lime-300">
            <ReceiptText size={15} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Factura {invoice.invoiceNumber}
            </p>
            <p className="text-[11px] text-white/40">
              {new Date(invoice.issuedAt).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/50">
          <Send size={10} />
          Lukea
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
          Destinatario
        </p>
        <Row label="Nombre" value={invoice.recipientName || "—"} />
        <Row label="País destino" value={invoice.countryName} />
        <Row label="Forma de entrega" value={invoice.deliveryMethod} />
        {invoice.recipientReference && (
          <Row label="Referencia" value={invoice.recipientReference} />
        )}
        <Row label="Recibe" value={receivedLabel} />
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
          Detalle del cobro
        </p>
        <Row label="Envías" value={`$${invoice.amount.toFixed(2)} ${invoice.currency}`} />
        <Row label="Costo de envío" value={`$${invoice.fee.toFixed(2)} ${invoice.currency}`} />
        {invoice.promoCode && (
          <Row label="Código promocional" value={invoice.promoCode} />
        )}
        <div className="mt-1 border-t border-white/10 pt-2">
          <Row
            label="Total cobrado"
            value={`$${invoice.total.toFixed(2)} ${invoice.currency}`}
            strong
          />
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <Row label="Método de pago" value={invoice.paymentMethod} />
        <Row label="Referencia de la orden" value={invoice.orderReference} />
      </div>

      <p className="border-t border-white/10 px-4 py-3 text-[10px] leading-relaxed text-white/25">
        Factura generada automáticamente por Lukea. Documento simulado, con
        fines de demostración.
      </p>
    </motion.div>
  );
}
