import { useEffect, useRef, useState } from "react";

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

// El servidor cachea las tasas 10 min, así que pedirlas más seguido que eso
// solo golpea nuestra propia caché (barato) y hace que la app se sienta "en
// vivo": apenas el servidor tiene un valor nuevo, lo recogemos en <=1 min.
const POLL_INTERVAL_MS = 60_000;

export function useLiveRates() {
  const [state, setState] = useState<LiveRatesState>({
    rates: null,
    updatedAt: null,
    loading: true,
    error: null,
  });
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRates = async () => {
      try {
        const res = await fetch("/api/rates");
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
          hasLoadedOnce.current = true;
          setState({
            rates: data.rates,
            updatedAt: data.updatedAt,
            loading: false,
            error: null,
          });
        }
      } catch (e) {
        if (cancelled) return;
        const message =
          e instanceof TypeError
            ? "No se pudo conectar con el servidor (¿está corriendo `npm run server` o `npm run dev:all`?)."
            : (e as Error).message;
        // Si ya teníamos tasas en vivo y solo falló un refresco en segundo
        // plano, las dejamos como están en vez de tirar todo a respaldo.
        setState((s) => ({
          ...s,
          loading: false,
          error: hasLoadedOnce.current ? s.error : message,
        }));
        if (import.meta.env.DEV) {
          console.warn("[useLiveRates] no se pudo refrescar:", message);
        }
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, POLL_INTERVAL_MS);

    const onFocus = () => fetchRates();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return state;
}
