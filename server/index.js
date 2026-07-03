import "dotenv/config";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import multer from "multer";
import Stripe from "stripe";
import {
  insertShipment,
  updateShipmentStatus,
  listShipments,
  getShipment,
  updateShipment,
  isDbConfigured,
} from "./db.js";

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
  STRIPE_WEBHOOK_SECRET,
  PAYMENTO_API_KEY,
  PAYMENTO_IPN_SECRET,
  PAYMENTO_API_BASE_URL = "https://api.paymento.io",
  PAYMENTO_GATEWAY_BASE_URL = "https://app.paymento.io/gateway",
  ADMIN_USERNAME = "admin",
  ADMIN_PASSWORD,
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

if (!isDbConfigured) {
  console.warn(
    "[server] DATABASE_URL no está definida — el dashboard de admin (/rtx) no va a tener nada que mostrar."
  );
}

if (!ADMIN_PASSWORD) {
  console.warn(
    "[server] ADMIN_PASSWORD no está definida — /api/admin/* queda deshabilitado hasta que la configures."
  );
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Comparación en tiempo constante para no filtrar la contraseña por
// diferencias de tiempo de respuesta (timing attack).
function safeEquals(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function requireAdminAuth(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ error: "El panel de admin no está configurado (falta ADMIN_PASSWORD)." });
  }

  const header = req.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="Lukea Admin"');
    return res.status(401).json({ error: "Autenticación requerida." });
  }

  const [user, pass] = Buffer.from(encoded, "base64").toString("utf8").split(":");
  if (!user || !pass || !safeEquals(user, ADMIN_USERNAME) || !safeEquals(pass, ADMIN_PASSWORD)) {
    res.set("WWW-Authenticate", 'Basic realm="Lukea Admin"');
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  next();
}

const app = express();
// Vercel (y cualquier proxy TLS-terminating) manda la conexión real por
// HTTPS pero nos la reenvía por HTTP con X-Forwarded-Proto: https — sin
// esto, req.protocol siempre da "http" y Paymento rechaza la returnUrl
// ("Only HTTPS URLs are allowed").
app.set("trust proxy", true);
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

// Guardar en la base de datos es "mejor esfuerzo": si Postgres no está
// conectado o falla por lo que sea, el pago real (Stripe/Paymento/etc.) no
// debe romperse por eso — el dashboard de admin simplemente no vería ese
// registro, en vez de tumbar el checkout completo del usuario.
async function saveShipment(shipment) {
  if (!isDbConfigured) return;
  try {
    await insertShipment(shipment);
  } catch (err) {
    console.error("[server] No se pudo guardar el envío en la base de datos:", err.message);
  }
}

async function markShipmentStatus(id, status) {
  if (!isDbConfigured) return;
  try {
    await updateShipmentStatus(id, status);
  } catch (err) {
    console.error("[server] No se pudo actualizar el estado del envío:", err.message);
  }
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

    await saveShipment({
      id: paymentIntent.id,
      paymentMethod: "stripe",
      status: "pending",
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
    });

    res.json({ clientSecret: paymentIntent.client_secret, fee, total });
  } catch (err) {
    console.error("[server] Error creando el PaymentIntent:", err.message);
    res.status(500).json({ error: "No se pudo iniciar el pago. Intenta de nuevo." });
  }
});

// Stripe llama a esta URL server-to-server cuando el pago se confirma o
// falla — hay que configurarla manualmente en tu dashboard de Stripe
// (Developers → Webhooks) apuntando a "<tu dominio>/api/stripe-webhook",
// escuchando payment_intent.succeeded y payment_intent.payment_failed.
app.post("/api/stripe-webhook", async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "El webhook de Stripe no está configurado." });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, req.get("stripe-signature"), STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn("[server] Webhook de Stripe con firma inválida:", err.message);
    return res.status(400).json({ error: "Firma inválida." });
  }

  if (event.type === "payment_intent.succeeded") {
    await markShipmentStatus(event.data.object.id, "paid");
  } else if (event.type === "payment_intent.payment_failed") {
    await markShipmentStatus(event.data.object.id, "failed");
  }

  res.json({ received: true });
});

// --- Pago con cripto vía Paymento -----------------------------------------
// A diferencia del resto de métodos manuales de esta app, Paymento procesa
// el pago en su checkout hospedado. Paymento solo da una `returnUrl` (no
// distingue éxito de cancelación en la redirección) y su propia doc dice
// que el redirect es solo informativo — la fuente de verdad es el webhook
// (IPN, firmado con HMAC) más la API de verify, así que /api/order-status
// llama a verify activamente en vez de esperar pasivamente el webhook (que
// además no puede alcanzar un servidor en localhost). El estado vive en la
// base de datos (no en memoria): en Vercel cada invocación puede caer en
// una instancia distinta, así que un Map en memoria no sería confiable.
//
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
  if (!isDbConfigured) {
    return res.status(503).json({
      error: "La base de datos no está configurada. Agrega DATABASE_URL en tu archivo .env para poder rastrear pagos con cripto.",
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
    await insertShipment({
      id: orderId,
      paymentMethod: "crypto",
      status: "pending",
      paymentoToken: token,
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
app.post("/api/paymento-webhook", async (req, res) => {
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
  if (OrderId) {
    await markShipmentStatus(OrderId, mapPaymentoStatus(Number(OrderStatus)));
    console.log(`[server] Webhook Paymento: pedido ${OrderId} → ${mapPaymentoStatus(Number(OrderStatus))}`);
  }

  res.status(200).json({ received: true });
});

app.get("/api/order-status/:orderId", async (req, res) => {
  if (!isDbConfigured) {
    return res.status(503).json({ error: "La base de datos no está configurada." });
  }

  let shipment;
  try {
    shipment = await getShipment(req.params.orderId);
  } catch (err) {
    console.error("[server] Error consultando el pedido:", err.message);
    return res.status(500).json({ error: "No se pudo consultar el pedido." });
  }
  if (!shipment) {
    return res.status(404).json({ error: "Pedido no encontrado." });
  }

  // El webhook puede no llegar nunca en desarrollo local (Paymento no puede
  // alcanzar localhost), así que además de esperarlo, consultamos verify
  // activamente mientras el pedido siga pendiente.
  if (shipment.status === "pending" && PAYMENTO_API_KEY && shipment.paymento_token) {
    try {
      const verified = await verifyPaymentoOrder(shipment.paymento_token);
      const nextStatus = mapPaymentoStatus(Number(verified.orderStatus));
      if (nextStatus !== shipment.status) {
        await updateShipmentStatus(shipment.id, nextStatus);
        shipment.status = nextStatus;
      }
    } catch (err) {
      console.warn("[server] No se pudo verificar el pedido con Paymento:", err.message);
    }
  }

  res.json({
    status: shipment.status,
    amount: Number(shipment.amount),
    fee: Number(shipment.fee),
    total: Number(shipment.total),
    countryName: shipment.country_name,
    deliveryMethod: shipment.delivery_method,
    recipientName: shipment.recipient_name,
    recipientReference: shipment.recipient_reference,
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
app.post("/api/eu-bank-transfer", proofUpload.single("proof"), async (req, res) => {
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

  await saveShipment({
    id: reference,
    paymentMethod: "eu_bank",
    status: "pending_review",
    amount: amountNum,
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
  });

  res.json({ reference, status: "pending_review", fee, total });
});

// El modo "Prueba" del checkout simula un pago exitoso enteramente en el
// navegador (sin tocar Stripe ni Paymento) — este endpoint solo existe para
// que esos envíos de prueba también aparezcan en el dashboard de admin,
// marcados como tales.
app.post("/api/record-test-payment", async (req, res) => {
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

  const fee = getTransferFee(amountNum);
  const total = Math.round((amountNum + fee) * 100) / 100;
  const reference = randomUUID();

  await saveShipment({
    id: reference,
    paymentMethod: "test",
    status: "test_completed",
    amount: amountNum,
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
  });

  res.json({ reference });
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
    dbConfigured: isDbConfigured,
    adminConfigured: Boolean(ADMIN_PASSWORD),
    ratesCached: Boolean(ratesCache.data),
    ratesFetchedAt: ratesCache.fetchedAt ? new Date(ratesCache.fetchedAt).toISOString() : null,
  });
});

// --- Dashboard de admin (/rtx en el frontend) ------------------------------
// Protegido con HTTP Basic Auth (usuario/contraseña por variable de
// entorno) — el navegador muestra su cuadro nativo de login apenas el
// frontend intenta pedir datos, no hace falta una pantalla propia.
app.use("/api/admin", requireAdminAuth);

app.get("/api/admin/shipments", async (_req, res) => {
  if (!isDbConfigured) {
    return res.status(503).json({ error: "La base de datos no está configurada." });
  }
  try {
    const shipments = await listShipments();
    res.json({ shipments });
  } catch (err) {
    console.error("[server] Error listando envíos:", err.message);
    res.status(500).json({ error: "No se pudieron cargar los envíos." });
  }
});

app.patch("/api/admin/shipments/:id", async (req, res) => {
  if (!isDbConfigured) {
    return res.status(503).json({ error: "La base de datos no está configurada." });
  }
  try {
    const updated = await updateShipment(req.params.id, req.body ?? {});
    if (!updated) {
      return res.status(404).json({ error: "Envío no encontrado." });
    }
    res.json({ shipment: updated });
  } catch (err) {
    console.error("[server] Error actualizando envío:", err.message);
    res.status(500).json({ error: "No se pudo actualizar el envío." });
  }
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
