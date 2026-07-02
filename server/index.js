import "dotenv/config";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const { STRIPE_SECRET_KEY, PORT = 8787 } = process.env;

if (!STRIPE_SECRET_KEY) {
  console.warn(
    "[server] STRIPE_SECRET_KEY no está definida. Copia .env.example a .env y agrega tus claves de prueba de Stripe."
  );
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

const app = express();
app.use(cors());
app.use(express.json());

// Mantener en sync con src/lib/fees.ts
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 2500;

function getTransferFee(amount) {
  return amount <= 1000 ? 2.99 : 15;
}

function truncate(value, max = 480) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

// --- Tasas de cambio en vivo ---------------------------------------------
// Fuentes gratuitas, sin API key. Probamos la primera y, si falla, la
// segunda antes de rendirnos. Le restamos FX_MARGIN al valor de mercado
// antes de mostrarlo: esa diferencia es el margen de Lukea. El cliente
// nunca ve la tasa cruda.
const RATES_SOURCES = [
  {
    url: "https://open.er-api.com/v6/latest/USD",
    parse: (json) => json?.rates,
  },
  {
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    parse: (json) => {
      const raw = json?.usd;
      if (!raw) return null;
      // esta fuente usa códigos en minúscula (mxn, cop, ...)
      return Object.fromEntries(
        Object.entries(raw).map(([code, value]) => [code.toUpperCase(), value])
      );
    },
  },
];

const RATES_TTL_MS = 10 * 60 * 1000; // 10 minutos
const FX_MARGIN = 0.005; // 0.5%

const SUPPORTED_CURRENCIES = [
  "MXN",
  "GTQ",
  "COP",
  "HNL",
  "DOP",
  "PEN",
  "NIO",
  "BOB",
  "VES",
  "BRL",
  "ARS",
  "PHP",
  "INR",
  "VND",
];

let ratesCache = { data: null, fetchedAt: 0 };

async function fetchMarketRates() {
  const errors = [];
  for (const source of RATES_SOURCES) {
    try {
      const res = await fetch(source.url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`respondió ${res.status}`);
      const json = await res.json();
      const marketRates = source.parse(json);
      if (!marketRates || typeof marketRates !== "object") {
        throw new Error("respuesta con formato inesperado");
      }
      return marketRates;
    } catch (err) {
      errors.push(`${source.url} → ${err.message}`);
    }
  }
  throw new Error(`Ninguna fuente de tasas respondió (${errors.join("; ")})`);
}

async function getLiveRates() {
  const now = Date.now();
  if (ratesCache.data && now - ratesCache.fetchedAt < RATES_TTL_MS) {
    return ratesCache.data;
  }

  try {
    const marketRates = await fetchMarketRates();

    const rates = {};
    for (const code of SUPPORTED_CURRENCIES) {
      const marketRate = marketRates[code];
      if (typeof marketRate === "number") {
        rates[code] = Math.round(marketRate * (1 - FX_MARGIN) * 10000) / 10000;
      }
    }
    if (Object.keys(rates).length === 0) {
      throw new Error("la respuesta no trajo ninguna de las monedas soportadas");
    }

    const data = { rates, marginApplied: FX_MARGIN, updatedAt: new Date().toISOString() };
    ratesCache = { data, fetchedAt: now };
    return data;
  } catch (err) {
    // Si ya teníamos un valor bueno (aunque esté vencido), lo seguimos
    // sirviendo en vez de romper la calculadora del usuario.
    if (ratesCache.data) {
      console.warn(
        `[server] No se pudieron refrescar las tasas, sirviendo el último valor cacheado: ${err.message}`
      );
      return ratesCache.data;
    }
    throw err;
  }
}

app.post("/api/create-payment-intent", async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error:
        "Stripe no está configurado en el servidor. Agrega STRIPE_SECRET_KEY en tu archivo .env.",
    });
  }

  const {
    amount,
    countryName,
    deliveryMethod,
    recipientName,
    recipientPhone,
    recipientEmail,
    recipientReference,
    recipientBank,
    recipientAccountType,
    recipientDocumentType,
    recipientDocumentNumber,
  } = req.body ?? {};

  if (typeof amount !== "number" || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return res.status(400).json({
      error: `El monto debe estar entre $${MIN_AMOUNT} y $${MAX_AMOUNT} USD.`,
    });
  }

  const fee = getTransferFee(amount);
  const total = Math.round((amount + fee) * 100) / 100;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      payment_method_types: ["card", "us_bank_account"],
      metadata: {
        sendAmount: amount.toFixed(2),
        feeAmount: fee.toFixed(2),
        countryName: truncate(countryName),
        deliveryMethod: truncate(deliveryMethod),
        recipientName: truncate(recipientName),
        recipientPhone: truncate(recipientPhone),
        recipientEmail: truncate(recipientEmail),
        recipientReference: truncate(recipientReference),
        recipientBank: truncate(recipientBank),
        recipientAccountType: truncate(recipientAccountType),
        recipientDocumentType: truncate(recipientDocumentType),
        recipientDocumentNumber: truncate(recipientDocumentNumber),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, fee, total });
  } catch (err) {
    console.error("[server] Error creando el PaymentIntent:", err.message);
    res.status(500).json({ error: "No se pudo iniciar el pago. Intenta de nuevo." });
  }
});

app.get("/api/rates", async (_req, res) => {
  try {
    const data = await getLiveRates();
    res.json(data);
  } catch (err) {
    console.error("[server] Error obteniendo tasas de cambio en vivo:", err.message);
    res.status(502).json({
      error: "No se pudieron obtener las tasas de cambio en vivo.",
      detail: err.message,
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    stripeConfigured: Boolean(stripe),
    ratesCached: Boolean(ratesCache.data),
    ratesFetchedAt: ratesCache.fetchedAt ? new Date(ratesCache.fetchedAt).toISOString() : null,
  });
});

// Sirve el frontend ya compilado (`npm run build`) para que un solo proceso
// atienda tanto la app como /api/*. Si no existe dist/ (por ejemplo en modo
// `npm run dev`, donde Vite sirve el frontend con su propio proxy a /api),
// esto simplemente no hace nada.
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[server] Escuchando en http://localhost:${PORT}`);
});
