import { useEffect, useState } from "react";

type RatesResponse = {
  rates: Record<string, number>;
  marginApplied: number;
  updatedAt: string;
};

type LiveRatesState = {
  rates: Record<string, number> | null;
  updatedAt: string | null;
  loading: boolean;
  error: string | null;
};

export function useLiveRates() {
  const [state, setState] = useState<LiveRatesState>({
    rates: null,
    updatedAt: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/rates")
      .then(async (res) => {
        const data = (await res.json()) as
          | RatesResponse
          | { error: string; detail?: string };
        if (!res.ok || !("rates" in data)) {
          const message =
            "error" in data
              ? data.detail
                ? `${data.error} (${data.detail})`
                : data.error
              : "No se pudieron obtener las tasas.";
          throw new Error(message);
        }
        if (!cancelled) {
          setState({
            rates: data.rates,
            updatedAt: data.updatedAt,
            loading: false,
            error: null,
          });
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          const message =
            e instanceof TypeError
              ? "No se pudo conectar con el servidor (¿está corriendo `npm run server` o `npm run dev:all`?)."
              : e.message;
          setState((s) => ({ ...s, loading: false, error: message }));
          if (import.meta.env.DEV) {
            console.warn("[useLiveRates] usando tasas de respaldo:", message);
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
