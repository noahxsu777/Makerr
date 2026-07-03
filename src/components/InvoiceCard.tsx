import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Loader2, ReceiptText } from "lucide-react";
import { downloadInvoicePdf, type Invoice } from "../lib/invoice";

type Props = {
  invoice: Invoice | null;
  loading: boolean;
  error: string | null;
  receivedLabel: string;
};

export default function InvoiceCard({
  invoice,
  loading,
  error,
  receivedLabel,
}: Props) {
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice, receivedLabel);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime-400/15 text-lime-300">
          <ReceiptText size={15} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            Factura {invoice.invoiceNumber}
          </p>
          <p className="text-xs text-white/40">
            {new Date(invoice.issuedAt).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/5 disabled:opacity-60"
      >
        {downloading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Download size={13} />
        )}
        Descargar factura (PDF)
      </button>

      <p className="mt-3 flex items-center justify-center gap-1 text-[10px] text-white/25">
        <FileText size={11} />
        Documento simulado, con fines de demostración
      </p>
    </motion.div>
  );
}
