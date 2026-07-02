import { useState, type ChangeEvent, type FormEvent } from "react";
import { User, Phone, Mail, Landmark, Hash } from "lucide-react";

export type Recipient = {
  fullName: string;
  phone: string;
  email: string;
  reference: string;
  bankName: string;
};

type Props = {
  deliveryLabel: string;
  initialValues: Recipient;
  onSubmit: (recipient: Recipient) => void;
};

function referenceFieldConfig(deliveryLabel: string) {
  switch (deliveryLabel) {
    case "Depósito bancario":
      return {
        label: "Número de cuenta o CLABE",
        placeholder: "0123 4567 8901 2345",
        showBank: true,
      };
    case "Retiro en efectivo":
      return {
        label: "Documento de identidad del destinatario",
        placeholder: "CURP / cédula / DNI",
        showBank: false,
      };
    default:
      return {
        label: "Número de la billetera móvil",
        placeholder: "+52 55 1234 5678",
        showBank: false,
      };
  }
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-lime-400/50";

export default function RecipientForm({
  deliveryLabel,
  initialValues,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Recipient>(initialValues);
  const field = referenceFieldConfig(deliveryLabel);

  const update = (key: keyof Recipient) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="relative">
        <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          required
          value={values.fullName}
          onChange={update("fullName")}
          placeholder="Nombre completo del destinatario"
          className={inputClasses}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            required
            type="tel"
            value={values.phone}
            onChange={update("phone")}
            placeholder="Teléfono del destinatario"
            className={inputClasses}
          />
        </div>
        <div className="relative">
          <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            required
            type="email"
            value={values.email}
            onChange={update("email")}
            placeholder="Tu correo (recibo del envío)"
            className={inputClasses}
          />
        </div>
      </div>

      {field.showBank && (
        <div className="relative">
          <Landmark size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            required
            value={values.bankName}
            onChange={update("bankName")}
            placeholder="Nombre del banco"
            className={inputClasses}
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/45">
          {field.label}
        </label>
        <div className="relative">
          <Hash size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            required
            value={values.reference}
            onChange={update("reference")}
            placeholder={field.placeholder}
            className={inputClasses}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        Continuar al pago
      </button>
    </form>
  );
}
