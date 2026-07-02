import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";

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
// Fuente: exchangerate-api.com (endpoint "open", gratis, sin API key).
// Le restamos FX_MARGIN al valor de mercado antes de mostrarlo: esa
// diferencia es el margen de Lukea. El cliente nunca ve la tasa cruda.
const RATES_SOURCE_URL = "https://open.er-api.com/v6/latest/USD";
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

async function getLiveRates() {
  const now = Date.now();
  if (ratesCache.data && now - ratesCache.fetchedAt < RATES_TTL_MS) {
    return ratesCache.data;
  }

  const res = await fetch(RATES_SOURCE_URL);
  if (!res.ok) {
    throw new Error(`La API de tasas respondió ${res.status}`);
  }
  const json = await res.json();
  const marketRates = json?.rates;
  if (!marketRates || typeof marketRates !== "object") {
    throw new Error("Respuesta inválida de la API de tasas");
  }

  const rates = {};
  for (const code of SUPPORTED_CURRENCIES) {
    const marketRate = marketRates[code];
    if (typeof marketRate === "number") {
      rates[code] = Math.round(marketRate * (1 - FX_MARGIN) * 10000) / 10000;
    }
  }

  const data = { rates, marginApplied: FX_MARGIN, updatedAt: new Date().toISOString() };
  ratesCache = { data, fetchedAt: now };
  return data;
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
    res.status(502).json({ error: "No se pudieron obtener las tasas de cambio en vivo." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, stripeConfigured: Boolean(stripe) });
});

app.listen(PORT, () => {
  console.log(`[server] Escuchando en http://localhost:${PORT}`);
});
