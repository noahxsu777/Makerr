import { useEffect, useRef, useState } from "react";
import { fetchLiveRatesDirect } from "./rates";

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

async function fetchFromBackend(): Promise<{
  rates: Record<string, number>;
  updatedAt: string;
}> {
  const res = await fetch("/api/rates");
  const text = await res.text();

  let data: RatesResponse | { error: string; detail?: string };
  try {
    data = JSON.parse(text);
  } catch {
    // El backend no está corriendo o /api no está enrutado ahí: el
    // navegador recibió HTML (una página de error) en vez de JSON.
    throw new Error("El backend no respondió JSON en /api/rates (¿está corriendo?)");
  }

  if (!res.ok || !("rates" in data)) {
    const message =
      "error" in data
        ? data.detail
          ? `${data.error} (${data.detail})`
          : data.error
        : "No se pudieron obtener las tasas.";
    throw new Error(message);
  }

  return { rates: data.rates, updatedAt: data.updatedAt };
}

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
      // 1) Intenta con nuestro backend (así el margen se calcula ahí y el
      //    cliente nunca ve la tasa cruda).
      try {
        const result = await fetchFromBackend();
        if (!cancelled) {
          hasLoadedOnce.current = true;
          setState({ ...result, loading: false, error: null });
        }
        return;
      } catch (backendErr) {
        // 2) El backend no está disponible (deploy sin backend, `npm run dev`
        //    sin el server, etc.): probamos pedir la tasa directo desde el
        //    navegador antes de rendirnos a la tasa de respaldo.
        try {
          const result = await fetchLiveRatesDirect();
          if (!cancelled) {
            hasLoadedOnce.current = true;
            setState({ ...result, loading: false, error: null });
          }
          return;
        } catch (directErr) {
          if (cancelled) return;
          const message = (directErr as Error).message;
          setState((s) => ({
            ...s,
            loading: false,
            error: hasLoadedOnce.current ? s.error : message,
          }));
          if (import.meta.env.DEV) {
            console.warn(
              "[useLiveRates] backend falló:",
              (backendErr as Error).message,
              "| fetch directo también falló:",
              message
            );
          }
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
