export type Invoice = {
  invoiceNumber: string;
  issuedAt: string;
  amount: number;
  fee: number;
  total: number;
  currency: string;
  countryName: string;
  deliveryMethod: string;
  paymentMethod: string;
  recipientName: string;
  recipientReference: string;
  orderReference: string;
};

export async function downloadInvoicePdf(invoice: Invoice, receivedLabel: string) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const marginX = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text("Lukea", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text("Made in the US · hecho para latinos", marginX, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text(`Factura ${invoice.invoiceNumber}`, 547, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(
    new Date(invoice.issuedAt).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    547,
    y + 16,
    { align: "right" }
  );

  y += 44;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, 547, y);
  y += 32;

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(label, marginX, y);
    doc.setTextColor(20, 20, 20);
    doc.text(value, 547, y, { align: "right" });
    y += 20;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Destinatario", marginX, y);
  y += 20;
  row("Nombre", invoice.recipientName || "—");
  row("País destino", invoice.countryName);
  row("Forma de entrega", invoice.deliveryMethod);
  if (invoice.recipientReference) {
    row("Referencia", invoice.recipientReference);
  }
  row("Recibe", `${receivedLabel} (${invoice.countryName})`);

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Detalle del cobro", marginX, y);
  y += 20;
  row("Envías", `$${invoice.amount.toFixed(2)} ${invoice.currency}`);
  row("Costo de envío", `$${invoice.fee.toFixed(2)} ${invoice.currency}`);

  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, 547, y);
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Total cobrado", marginX, y);
  doc.text(`$${invoice.total.toFixed(2)} ${invoice.currency}`, 547, y, {
    align: "right",
  });

  y += 40;
  row("Método de pago", invoice.paymentMethod);
  row("Referencia de la orden", invoice.orderReference);

  y += 24;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, 547, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Factura generada automáticamente por Lukea. Este documento es una simulación con fines de demostración.",
    marginX,
    y,
    { maxWidth: 499 }
  );

  doc.save(`${invoice.invoiceNumber}.pdf`);
}
