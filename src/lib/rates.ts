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
  EUR: 0.92,
};

export function getFallbackRate(currency: string): number {
  if (currency === "USD") return 1;
  return FALLBACK_RATES[currency] ?? 1;
}

const SUPPORTED_CURRENCIES = Object.keys(FALLBACK_RATES);

// Mismo margen que aplica el backend en server/index.js — se repite acá
// porque esta función solo se usa cuando el backend no está disponible
// (ver fetchLiveRatesDirect).
const FX_MARGIN = 0.025;

type DirectSource = {
  url: string;
  parse: (json: unknown) => Record<string, number> | null;
};

const DIRECT_SOURCES: DirectSource[] = [
  {
    url: "https://api.exchangerate.fun/latest?base=USD",
    parse: (json) => (json as { rates?: Record<string, number> })?.rates ?? null,
  },
  {
    url: "https://open.er-api.com/v6/latest/USD",
    parse: (json) => (json as { rates?: Record<string, number> })?.rates ?? null,
  },
];

// Llama a la API de tasas directo desde el navegador (sin pasar por
// nuestro backend) y le aplica el mismo margen. Es el respaldo para cuando
// /api/rates no está disponible: sitio desplegado sin el backend corriendo,
// o `npm run dev` sin `npm run server`.
export async function fetchLiveRatesDirect(): Promise<{
  rates: Record<string, number>;
  updatedAt: string;
}> {
  const errors: string[] = [];

  for (const source of DIRECT_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`respondió ${res.status}`);
      const json = await res.json();
      const marketRates = source.parse(json);
      if (!marketRates) throw new Error("respuesta con formato inesperado");

      const rates: Record<string, number> = {};
      for (const code of SUPPORTED_CURRENCIES) {
        const marketRate = marketRates[code];
        if (typeof marketRate === "number") {
          rates[code] = Math.round(marketRate * (1 - FX_MARGIN) * 10000) / 10000;
        }
      }
      if (Object.keys(rates).length === 0) {
        throw new Error("sin monedas soportadas en la respuesta");
      }

      return { rates, updatedAt: new Date().toISOString() };
    } catch (err) {
      errors.push(`${source.url} → ${(err as Error).message}`);
    }
  }

  throw new Error(`No se pudo obtener tasas directamente (${errors.join("; ")})`);
}
