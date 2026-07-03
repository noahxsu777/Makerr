import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCcw,
  X,
  ServerCrash,
  Save,
  Search,
} from "lucide-react";

type Shipment = {
  id: string;
  created_at: string;
  updated_at: string;
  payment_method: string;
  status: string;
  amount: string | number;
  fee: string | number;
  total: string | number;
  country_name: string | null;
  delivery_method: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_email: string | null;
  recipient_reference: string | null;
  recipient_bank: string | null;
  recipient_account_type: string | null;
  recipient_document_type: string | null;
  recipient_document_number: string | null;
  recipient_bank_code: string | null;
  promo_code: string | null;
  admin_notes: string | null;
};

const EDITABLE_FIELDS: { key: keyof Shipment; label: string }[] = [
  { key: "status", label: "Estado" },
  { key: "country_name", label: "País" },
  { key: "delivery_method", label: "Forma de entrega" },
  { key: "recipient_name", label: "Nombre del destinatario" },
  { key: "recipient_phone", label: "Teléfono" },
  { key: "recipient_email", label: "Correo" },
  { key: "recipient_reference", label: "Referencia (cuenta/IBAN/CBU/etc.)" },
  { key: "recipient_bank", label: "Banco" },
  { key: "recipient_account_type", label: "Tipo de cuenta" },
  { key: "recipient_document_type", label: "Tipo de documento" },
  { key: "recipient_document_number", label: "Número de documento" },
  { key: "recipient_bank_code", label: "Código bancario (BIC/SWIFT/IFSC)" },
];

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "failed",
  "pending_review",
  "test_completed",
];

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-lime-400/15 text-lime-300",
  test_completed: "bg-lime-400/15 text-lime-300",
  pending: "bg-amber-400/15 text-amber-300",
  pending_review: "bg-amber-400/15 text-amber-300",
  failed: "bg-red-500/15 text-red-300",
};

function money(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-white/10 text-white/60"
      }`}
    >
      {status}
    </span>
  );
}

function EditPanel({
  shipment,
  onClose,
  onSaved,
}: {
  shipment: Shipment;
  onClose: () => void;
  onSaved: (updated: Shipment) => void;
}) {
  const [values, setValues] = useState<Shipment>(shipment);
  const [notes, setNotes] = useState(shipment.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const patch: Record<string, string | null> = { admin_notes: notes };
      for (const { key } of EDITABLE_FIELDS) {
        patch[key] = (values[key] as string) ?? null;
      }
      const res = await fetch(`/api/admin/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      onSaved(data.shipment);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>

        <h3 className="font-display text-lg font-bold text-white">Editar envío</h3>
        <p className="mt-1 font-mono text-xs text-white/40">{shipment.id}</p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/45">Estado</label>
            <select
              value={values.status}
              onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {EDITABLE_FIELDS.filter((f) => f.key !== "status").map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium text-white/45">{f.label}</label>
              <input
                value={(values[f.key] as string) ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-lime-400/50"
              />
            </div>
          ))}

          <div>
            <label className="mb-1 block text-xs font-medium text-white/45">Notas internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-lime-400/50"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-3 font-display text-sm font-bold text-ink-950 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar cambios
        </button>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const [shipments, setShipments] = useState<Shipment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Shipment | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shipments");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar la lista.");
      setShipments(data.shipments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = (shipments ?? []).filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      (s.recipient_name ?? "").toLowerCase().includes(q) ||
      (s.recipient_email ?? "").toLowerCase().includes(q) ||
      (s.country_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-ink-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Solicitudes de envío</h1>
            <p className="mt-1 text-sm text-white/45">
              {shipments ? `${shipments.length} registros` : loading ? "Cargando…" : "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, correo, país, id…"
                className="w-64 rounded-full border border-white/10 bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-lime-400/50"
              />
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              <RefreshCcw size={14} />
              Actualizar
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-16 flex flex-col items-center gap-3 text-white/50">
            <Loader2 size={28} className="animate-spin text-lime-300" />
            Cargando envíos…
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-5 text-sm text-red-300">
            <ServerCrash size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && shipments && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-white/40">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Destinatario</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="cursor-pointer border-t border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-white/60">
                      {new Date(s.created_at).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-white/80">{s.payment_method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-white/80">{s.country_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="text-white/90">{s.recipient_name ?? "—"}</div>
                      <div className="text-xs text-white/35">{s.recipient_email ?? ""}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-lime-300">
                      ${money(s.total)}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-white/40">
                      {s.id}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/40">
                      No hay envíos que coincidan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <EditPanel
          shipment={selected}
          onClose={() => setSelected(null)}
          onSaved={(updated) =>
            setShipments((prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? prev)
          }
        />
      )}
    </div>
  );
}
