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
  promoCode?: string;
};

// No hay un proveedor de facturación real conectado, así que esto se genera
// enteramente en el navegador (sin llamar al backend): así nunca falla por
// no tener un servidor corriendo o por un deploy donde /api no esté
// enrutado. El contador vive en localStorage, por eso los números se ven
// consecutivos dentro del mismo navegador.
const COUNTER_KEY = "lukea_invoice_counter";

function nextInvoiceNumber(): string {
  let counter = 1000;
  try {
    const stored = window.localStorage.getItem(COUNTER_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    if (Number.isFinite(parsed)) counter = parsed;
  } catch {
    // localStorage no disponible (modo privado, etc.) — seguimos con el valor por defecto.
  }

  counter += 1;

  try {
    window.localStorage.setItem(COUNTER_KEY, String(counter));
  } catch {
    // ignorar: solo perdemos la numeración consecutiva entre sesiones.
  }

  return `LUK-${new Date().getFullYear()}-${String(counter).padStart(5, "0")}`;
}

export function createInvoice(input: {
  amount: number;
  fee: number;
  total: number;
  countryName: string;
  deliveryMethod: string;
  paymentMethod: string;
  recipientName: string;
  recipientReference: string;
  orderReference: string;
  promoCode?: string;
}): Invoice {
  return {
    invoiceNumber: nextInvoiceNumber(),
    issuedAt: new Date().toISOString(),
    currency: "USD",
    ...input,
  };
}
