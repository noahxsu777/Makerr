// Tasas de cambio (USD -> moneda local), separadas de la identidad de cada
// país (ver `countries` en data.ts). Estas son solo el respaldo que se usa
// mientras llegan las tasas en vivo desde /api/rates, o si esa llamada falla.
export const FALLBACK_RATES: Record<string, number> = {
  MXN: 18.42,
  GTQ: 7.79,
  COP: 4128,
  HNL: 24.71,
  DOP: 60.15,
  PEN: 3.71,
  NIO: 36.6,
  BOB: 6.91,
  VES: 39.8,
  BRL: 5.44,
  ARS: 913.2,
  PHP: 56.9,
  INR: 83.5,
  VND: 25410,
};

export function getFallbackRate(currency: string): number {
  if (currency === "USD") return 1;
  return FALLBACK_RATES[currency] ?? 1;
}
