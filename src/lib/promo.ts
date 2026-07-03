export type PromoCode = {
  code: string;
  label: string;
  kind: "percent" | "flat";
  value: number;
};

// Sin backend de promociones real: son códigos de demostración validados en
// el navegador. El descuento se aplica sobre el costo de envío.
const PROMO_CODES: Record<string, PromoCode> = {
  LUKEA10: {
    code: "LUKEA10",
    label: "10% de descuento en el costo de envío",
    kind: "percent",
    value: 10,
  },
  BIENVENIDO: {
    code: "BIENVENIDO",
    label: "Envío gratis en tu primer envío",
    kind: "percent",
    value: 100,
  },
  AHORRA5: {
    code: "AHORRA5",
    label: "$5.00 USD de descuento",
    kind: "flat",
    value: 5,
  },
};

export function findPromoCode(input: string): PromoCode | null {
  return PROMO_CODES[input.trim().toUpperCase()] ?? null;
}

export function getPromoDiscount(fee: number, promo: PromoCode): number {
  const rawDiscount = promo.kind === "percent" ? fee * (promo.value / 100) : promo.value;
  return Math.round(Math.min(rawDiscount, fee) * 100) / 100;
}
