import { useState, type ChangeEvent, type FormEvent } from "react";
import { User, Phone, Mail, Landmark, Hash, IdCard } from "lucide-react";

export type Recipient = {
  fullName: string;
  phone: string;
  email: string;
  reference: string;
  bankName: string;
  accountType: string;
  documentType: string;
  documentNumber: string;
};

type Props = {
  countryName: string;
  deliveryLabel: string;
  initialValues: Recipient;
  onSubmit: (recipient: Recipient) => void;
};

const colombiaDocumentTypes = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PA", label: "Pasaporte" },
];

function referenceFieldConfig(countryName: string, deliveryLabel: string) {
  if (deliveryLabel === "Depósito bancario") {
    if (countryName === "Perú") {
      return {
        label: "CCI (Código de Cuenta Interbancaria)",
        placeholder: "20 dígitos",
        maxLength: 20,
        showBank: true,
        showColombiaFields: false,
      };
    }
    if (countryName === "México") {
      return {
        label: "CLABE interbancaria",
        placeholder: "18 dígitos",
        maxLength: 18,
        showBank: true,
        showColombiaFields: false,
      };
    }
    if (countryName === "Colombia") {
      return {
        label: "Número de cuenta bancaria",
        placeholder: "0123 4567 8901",
        maxLength: undefined,
        showBank: true,
        showColombiaFields: true,
      };
    }
    return {
      label: "Número de cuenta bancaria",
      placeholder: "0123 4567 8901 2345",
      maxLength: undefined,
      showBank: true,
      showColombiaFields: false,
    };
  }
  if (deliveryLabel === "Retiro en efectivo") {
    return {
      label: "Documento de identidad del destinatario",
      placeholder: "CURP / cédula / DNI",
      maxLength: undefined,
      showBank: false,
      showColombiaFields: false,
    };
  }
  return {
    label: "Número de la billetera móvil",
    placeholder: "+52 55 1234 5678",
    maxLength: undefined,
    showBank: false,
    showColombiaFields: false,
  };
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-lime-400/50";

const selectClasses =
  "w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-ink-900 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-lime-400/50";

export default function RecipientForm({
  countryName,
  deliveryLabel,
  initialValues,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Recipient>(initialValues);
  const field = referenceFieldConfig(countryName, deliveryLabel);

  const update = (key: keyof Recipient) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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

      {field.showColombiaFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <IdCard size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <select
              required
              value={values.documentType}
              onChange={update("documentType")}
              className={selectClasses}
            >
              <option value="" disabled>
                Tipo de documento
              </option>
              {colombiaDocumentTypes.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Hash size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              required
              value={values.documentNumber}
              onChange={update("documentNumber")}
              placeholder="Número de documento"
              className={inputClasses}
            />
          </div>
          <div className="relative sm:col-span-2">
            <Landmark size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <select
              required
              value={values.accountType}
              onChange={update("accountType")}
              className={selectClasses}
            >
              <option value="" disabled>
                Tipo de cuenta
              </option>
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
            </select>
          </div>
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
            maxLength={field.maxLength}
            inputMode={field.showBank ? "numeric" : undefined}
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
