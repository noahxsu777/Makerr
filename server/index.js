import "dotenv/config";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { randomUUID, createHmac } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import multer from "multer";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
// En Vercel el filesystem es de solo lectura salvo /tmp (y ni siquiera eso
// persiste entre invocaciones) — sin este branch, mkdirSync tira EROFS al
// cargar el módulo y tumba la función entera para *todas* las rutas, no
// solo las de subida de archivos.
const uploadsDir = process.env.VERCEL ? "/tmp/uploads" : path.join(__dirname, "uploads");
mkdirSync(uploadsDir, { recursive: true });

const {
  STRIPE_SECRET_KEY,
  PAYMENTO_API_KEY,
  PAYMENTO_IPN_SECRET,
  PAYMENTO_API_BASE_URL = "https://api.paymento.io",
  PAYMENTO_GATEWAY_BASE_URL = "https://app.paymento.io/gateway",
  PORT = 8787,
} = process.env;

if (!STRIPE_SECRET_KEY) {
  console.warn(
    "[server] STRIPE_SECRET_KEY no está definida. Copia .env.example a .env y agrega tus claves de prueba de Stripe."
  );
}

if (!PAYMENTO_API_KEY) {
  console.warn(
    "[server] PAYMENTO_API_KEY no está definida. Copia .env.example a .env y agrega tu clave de Paymento."
  );
}

if (!PAYMENTO_IPN_SECRET) {
  console.warn(
    "[server] PAYMENTO_IPN_SECRET no está definida — no se podrá verificar la firma de los webhooks de Paymento."
  );
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

const app = express();
app.use(cors());
// El callback (IPN) de Paymento firma el body crudo con HMAC-SHA256 — hay
// que guardarlo tal cual antes de que este middleware lo parsee a JSON.
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

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
// Fuentes gratuitas, sin API key. Probamos la primera (exchangerate.fun,
// la que nos pasaron) y si falla, las siguientes como respaldo antes de
// rendirnos. Le restamos FX_MARGIN al valor de mercado antes de mostrarlo:
// esa diferencia es el margen de Lukea. El cliente nunca ve la tasa cruda.
const RATES_SOURCES = [
  {
    url: "https://api.exchangerate.fun/latest?base=USD",
    parse: (json) => json?.rates,
  },
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
const FX_MARGIN = 0.025; // 2.5%

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
  "EUR",
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
    recipientBankCode,
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
        recipientBankCode: truncate(recipientBankCode),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret, fee, total });
  } catch (err) {
    console.error("[server] Error creando el PaymentIntent:", err.message);
    res.status(500).json({ error: "No se pudo iniciar el pago. Intenta de nuevo." });
  }
});

// --- Pago con cripto vía Paymento -----------------------------------------
// A diferencia del resto de métodos manuales de esta app, Paymento procesa
// el pago en su checkout hospedado. Paymento solo da una `returnUrl` (no
// distingue éxito de cancelación en la redirección) y su propia doc dice
// que el redirect es solo informativo — la fuente de verdad es el webhook
// (IPN, firmado con HMAC) más la API de verify, así que /api/order-status
// llama a verify activamente en vez de esperar pasivamente el webhook (que
// además no puede alcanzar un servidor en localhost). Como no hay base de
// datos, el estado del pedido vive en memoria (se pierde si el servidor se
// reinicia; suficiente para esta demo).
const cryptoOrders = new Map();

// https://api.paymento.io/v1/payment/verify — swagger: OrderStatus 0..9,
// pero solo 7 (Paid) documentado como estado de éxito; 4 (Timeout),
// 5 (UserCanceled) y 9 (Reject) como estados terminales de fallo. El resto
// (0,1,2,3,8) se trata como "todavía procesando".
function mapPaymentoStatus(orderStatus) {
  if (orderStatus === 7) return "paid";
  if ([4, 5, 9].includes(orderStatus)) return "failed";
  return "pending";
}

async function verifyPaymentoOrder(token) {
  const res = await fetch(`${PAYMENTO_API_BASE_URL}/v1/payment/verify`, {
    method: "POST",
    headers: { "Api-Key": PAYMENTO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "No se pudo verificar el pago con Paymento.");
  }
  return data.body;
}

app.post("/api/create-crypto-session", async (req, res) => {
  if (!PAYMENTO_API_KEY) {
    return res.status(503).json({
      error: "Paymento no está configurado en el servidor. Agrega PAYMENTO_API_KEY en tu archivo .env.",
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
    recipientBankCode,
    promoCode,
  } = req.body ?? {};

  if (typeof amount !== "number" || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return res.status(400).json({
      error: `El monto debe estar entre $${MIN_AMOUNT} y $${MAX_AMOUNT} USD.`,
    });
  }

  const fee = getTransferFee(amount);
  const total = Math.round((amount + fee) * 100) / 100;
  const orderId = randomUUID();
  const origin = `${req.protocol}://${req.get("host")}`;

  try {
    const paymentoRes = await fetch(`${PAYMENTO_API_BASE_URL}/v1/payment/request`, {
      method: "POST",
      headers: { "Api-Key": PAYMENTO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        fiatAmount: total.toFixed(2),
        fiatCurrency: "USD",
        returnUrl: `${origin}/?paymento=return&orderId=${orderId}`,
        orderId,
        riskSpeed: 1, // esperar confirmaciones antes de dar el pago por bueno
      }),
    });

    const rawText = await paymentoRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      // Si Paymento (o un proxy/CDN delante) responde HTML en vez de JSON,
      // normalmente es que PAYMENTO_API_BASE_URL o la ruta están mal.
      throw new Error(
        `Paymento respondió ${paymentoRes.status} sin JSON válido — revisa PAYMENTO_API_BASE_URL. Cuerpo: ${rawText.slice(0, 200)}`
      );
    }
    if (!paymentoRes.ok || !data.success || !data.body) {
      throw new Error(data.message || `Paymento rechazó la sesión de pago (HTTP ${paymentoRes.status}).`);
    }

    const token = data.body;
    cryptoOrders.set(orderId, {
      status: "pending",
      createdAt: Date.now(),
      token,
      amount,
      fee,
      total,
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
      recipientBankCode: truncate(recipientBankCode),
      promoCode: truncate(promoCode),
    });

    res.json({ orderId, paymentUrl: `${PAYMENTO_GATEWAY_BASE_URL}?token=${encodeURIComponent(token)}` });
  } catch (err) {
    console.error("[server] Error creando sesión de Paymento:", err.message);
    res.status(500).json({
      error: "No se pudo iniciar el pago con Paymento. Intenta de nuevo.",
      detail: err.message,
    });
  }
});

// Paymento llama a esta URL server-to-server (IPN) cuando el estado del
// pago cambia. Hay que configurarla manualmente como "IPN URL" en el
// dashboard de Paymento apuntando a "<tu dominio>/api/paymento-webhook" —
// la API de creación de sesión no acepta una URL de callback por request.
app.post("/api/paymento-webhook", (req, res) => {
  if (PAYMENTO_IPN_SECRET) {
    const signature = req.get("X-HMAC-SHA256-SIGNATURE");
    const expected = req.rawBody
      ? createHmac("sha256", PAYMENTO_IPN_SECRET).update(req.rawBody).digest("hex").toUpperCase()
      : null;
    if (!signature || !expected || signature.toUpperCase() !== expected) {
      console.warn("[server] Webhook de Paymento con firma inválida, se ignora.");
      return res.status(401).json({ error: "Firma inválida." });
    }
  }

  const { OrderId, OrderStatus } = req.body ?? {};
  const order = OrderId ? cryptoOrders.get(OrderId) : null;
  if (!order) {
    console.warn("[server] Webhook de Paymento con orderId desconocido:", OrderId);
    return res.status(200).json({ received: true });
  }

  order.status = mapPaymentoStatus(Number(OrderStatus));
  cryptoOrders.set(OrderId, order);
  console.log(`[server] Webhook Paymento: pedido ${OrderId} → ${order.status}`);

  res.status(200).json({ received: true });
});

app.get("/api/order-status/:orderId", async (req, res) => {
  const order = cryptoOrders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado." });
  }

  // El webhook puede no llegar nunca en desarrollo local (Paymento no puede
  // alcanzar localhost), así que además de esperarlo, consultamos verify
  // activamente mientras el pedido siga pendiente.
  if (order.status === "pending" && PAYMENTO_API_KEY) {
    try {
      const verified = await verifyPaymentoOrder(order.token);
      order.status = mapPaymentoStatus(Number(verified.orderStatus));
      cryptoOrders.set(req.params.orderId, order);
    } catch (err) {
      console.warn("[server] No se pudo verificar el pedido con Paymento:", err.message);
    }
  }

  res.json({
    status: order.status,
    amount: order.amount,
    fee: order.fee,
    total: order.total,
    countryName: order.countryName,
    deliveryMethod: order.deliveryMethod,
    recipientName: order.recipientName,
    recipientReference: order.recipientReference,
  });
});

const proofUpload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se aceptan imágenes (captura de pantalla del pago)."));
    }
    cb(null, true);
  },
});

// --- Pago manual por transferencia bancaria europea ----------------------
// Para remitentes en Europa que no tienen tarjeta o cuenta de EE.UU. para
// pagar vía Stripe: transfieren a la cuenta receptora de Lukea (IBAN/SWIFT
// en Reino Unido) y suben comprobante — sin verificación automática, queda
// pendiente de revisión manual.
app.post("/api/eu-bank-transfer", proofUpload.single("proof"), (req, res) => {
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
    recipientBankCode,
  } = req.body ?? {};

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum < MIN_AMOUNT || amountNum > MAX_AMOUNT) {
    return res.status(400).json({
      error: `El monto debe estar entre $${MIN_AMOUNT} y $${MAX_AMOUNT} USD.`,
    });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Adjunta un comprobante de la transferencia para continuar." });
  }

  const fee = getTransferFee(amountNum);
  const total = Math.round((amountNum + fee) * 100) / 100;
  const reference = randomUUID();

  console.log(
    `[server] Transferencia bancaria europea pendiente de revisión ${reference}: $${total} · ${truncate(recipientName)} · ${truncate(countryName)} · comprobante ${req.file.filename}`,
    {
      deliveryMethod: truncate(deliveryMethod),
      recipientPhone: truncate(recipientPhone),
      recipientEmail: truncate(recipientEmail),
      recipientReference: truncate(recipientReference),
      recipientBank: truncate(recipientBank),
      recipientAccountType: truncate(recipientAccountType),
      recipientDocumentType: truncate(recipientDocumentType),
      recipientDocumentNumber: truncate(recipientDocumentNumber),
      recipientBankCode: truncate(recipientBankCode),
    }
  );

  res.json({ reference, status: "pending_review", fee, total });
});

// Nota: la factura simulada se genera enteramente en el navegador
// (src/lib/invoice.ts) para que no dependa de que este backend esté
// corriendo — no hay endpoint de facturas aquí a propósito.

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
    paymentoConfigured: Boolean(PAYMENTO_API_KEY),
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

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[server] Error no manejado:", err.message);
  res.status(400).json({ error: err.message || "Ocurrió un error inesperado." });
});

// En Vercel este archivo se importa como función serverless (ver
// api/[...path].js) — Vercel maneja el listener HTTP, así que no hay que
// levantar uno propio ahí. Solo escuchamos en el puerto cuando este archivo
// se ejecuta directamente (`npm run server` / `npm run dev:all`).
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`[server] Escuchando en http://localhost:${PORT}`);
  });
}

export default app;
