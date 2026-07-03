import { neon } from "@neondatabase/serverless";

// Vercel inyecta esto solo cuando conectas una base de datos (Neon/Postgres)
// desde la pestaña "Storage" de tu proyecto — sin eso, sql queda null y cada
// función de acá tira un error claro en vez de intentar conectar a nada.
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const isDbConfigured = Boolean(DATABASE_URL);
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

function requireSql() {
  if (!sql) {
    throw new Error(
      "No hay base de datos conectada. Agrega DATABASE_URL (o conecta un Postgres de Neon desde Vercel → Storage)."
    );
  }
  return sql;
}

let schemaReady = null;

// CREATE TABLE IF NOT EXISTS es barato, así que en vez de una migración
// aparte simplemente nos aseguramos de que la tabla exista antes de cada
// operación (cacheado en `schemaReady` para no repetirlo en cada request).
// `id` ES la referencia natural de cada método (payment intent id de
// Stripe, orderId de Paymento, o un UUID nuestro) — no hace falta una
// columna de referencia aparte.
export async function ensureSchema() {
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL,
        paymento_token TEXT,
        amount NUMERIC NOT NULL,
        fee NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        country_name TEXT,
        delivery_method TEXT,
        recipient_name TEXT,
        recipient_phone TEXT,
        recipient_email TEXT,
        recipient_reference TEXT,
        recipient_bank TEXT,
        recipient_account_type TEXT,
        recipient_document_type TEXT,
        recipient_document_number TEXT,
        recipient_bank_code TEXT,
        promo_code TEXT,
        admin_notes TEXT
      )
    `;
  }
  await schemaReady;
}

export async function insertShipment(shipment) {
  const db = requireSql();
  await ensureSchema();
  await db`
    INSERT INTO shipments (
      id, payment_method, status, paymento_token,
      amount, fee, total, country_name, delivery_method,
      recipient_name, recipient_phone, recipient_email, recipient_reference,
      recipient_bank, recipient_account_type, recipient_document_type,
      recipient_document_number, recipient_bank_code, promo_code
    ) VALUES (
      ${shipment.id}, ${shipment.paymentMethod}, ${shipment.status},
      ${shipment.paymentoToken ?? null},
      ${shipment.amount}, ${shipment.fee}, ${shipment.total},
      ${shipment.countryName ?? null}, ${shipment.deliveryMethod ?? null},
      ${shipment.recipientName ?? null}, ${shipment.recipientPhone ?? null},
      ${shipment.recipientEmail ?? null}, ${shipment.recipientReference ?? null},
      ${shipment.recipientBank ?? null}, ${shipment.recipientAccountType ?? null},
      ${shipment.recipientDocumentType ?? null}, ${shipment.recipientDocumentNumber ?? null},
      ${shipment.recipientBankCode ?? null}, ${shipment.promoCode ?? null}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function updateShipmentStatus(id, status) {
  const db = requireSql();
  await ensureSchema();
  await db`
    UPDATE shipments SET status = ${status}, updated_at = now() WHERE id = ${id}
  `;
}

export async function listShipments(limit = 300) {
  const db = requireSql();
  await ensureSchema();
  return db`
    SELECT * FROM shipments ORDER BY created_at DESC LIMIT ${limit}
  `;
}

export async function getShipment(id) {
  const db = requireSql();
  await ensureSchema();
  const rows = await db`SELECT * FROM shipments WHERE id = ${id} LIMIT 1`;
  return rows[0] ?? null;
}

// Columnas que un admin puede editar a mano desde el dashboard — todo lo
// demás (id, timestamps, paymento_token) no se toca.
const EDITABLE_COLUMNS = [
  "status",
  "country_name",
  "delivery_method",
  "recipient_name",
  "recipient_phone",
  "recipient_email",
  "recipient_reference",
  "recipient_bank",
  "recipient_account_type",
  "recipient_document_type",
  "recipient_document_number",
  "recipient_bank_code",
  "admin_notes",
];

export async function updateShipment(id, patch) {
  const db = requireSql();
  await ensureSchema();

  const entries = Object.entries(patch).filter(([key]) => EDITABLE_COLUMNS.includes(key));
  if (entries.length === 0) return getShipment(id);

  // neon() no soporta interpolar nombres de columna dinámicos en su plantilla
  // etiquetada, así que se arma el SET a mano — pero solo con nombres de la
  // lista fija de arriba, nunca con algo que venga directo del request body.
  const setClause = entries.map(([key], i) => `${key} = $${i + 2}`).join(", ");
  const values = entries.map(([, value]) => value);

  const rows = await db.query(
    `UPDATE shipments SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] ?? null;
}
