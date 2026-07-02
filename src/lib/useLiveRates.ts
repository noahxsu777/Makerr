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
        const data = (await res.json()) as RatesResponse | { error: string };
        if (!res.ok || !("rates" in data)) {
          throw new Error(
            "error" in data ? data.error : "No se pudieron obtener las tasas."
          );
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
          setState((s) => ({ ...s, loading: false, error: e.message }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
