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
  bankCode: string;
};

type Props = {
  countryName: string;
  currency: string;
  deliveryLabel: string;
  initialValues: Recipient;
  onSubmit: (recipient: Recipient) => void;
};

type DocumentTypeOption = { value: string; label: string };

const colombiaDocumentTypes: DocumentTypeOption[] = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PA", label: "Pasaporte" },
];

const argentinaDocumentTypes: DocumentTypeOption[] = [
  { value: "DNI", label: "DNI" },
  { value: "CUIT", label: "CUIT" },
  { value: "CUIL", label: "CUIL" },
];

const brasilDocumentTypes: DocumentTypeOption[] = [{ value: "CPF", label: "CPF" }];

type BankDepositConfig = {
  label: string;
  placeholder: string;
  maxLength?: number;
  showBank: boolean;
  showAccountType?: boolean;
  documentTypes?: DocumentTypeOption[];
  extraField?: { label: string; placeholder: string; maxLength?: number };
};

// Formatos de cuenta bancaria por país destino: cada red bancaria pide un
// identificador distinto para que el depósito llegue a la cuenta correcta.
const BANK_DEPOSIT_CONFIG: Record<string, BankDepositConfig> = {
  Perú: {
    label: "CCI (Código de Cuenta Interbancaria)",
    placeholder: "20 dígitos",
    maxLength: 20,
    showBank: true,
  },
  México: {
    label: "CLABE interbancaria",
    placeholder: "18 dígitos",
    maxLength: 18,
    showBank: true,
  },
  Colombia: {
    label: "Número de cuenta bancaria",
    placeholder: "0123 4567 8901",
    showBank: true,
    showAccountType: true,
    documentTypes: colombiaDocumentTypes,
  },
  Argentina: {
    label: "CBU (Clave Bancaria Uniforme)",
    placeholder: "22 dígitos",
    maxLength: 22,
    showBank: false,
    documentTypes: argentinaDocumentTypes,
  },
  Brasil: {
    label: "Número de cuenta (agência + conta)",
    placeholder: "1234 / 56789-0",
    showBank: true,
    documentTypes: brasilDocumentTypes,
  },
  India: {
    label: "Número de cuenta bancaria",
    placeholder: "0123456789012",
    showBank: true,
    extraField: {
      label: "Código IFSC",
      placeholder: "SBIN0001234",
      maxLength: 11,
    },
  },
};

const EU_BANK_DEPOSIT_CONFIG: BankDepositConfig = {
  label: "IBAN",
  placeholder: "ES91 2100 0418 4502 0005 1332",
  maxLength: 34,
  showBank: false,
  extraField: {
    label: "Código BIC / SWIFT",
    placeholder: "BBVAESMMXXX",
    maxLength: 11,
  },
};

const DEFAULT_BANK_DEPOSIT_CONFIG: BankDepositConfig = {
  label: "Número de cuenta bancaria",
  placeholder: "0123 4567 8901 2345",
  showBank: true,
};

function referenceFieldConfig(
  countryName: string,
  currency: string,
  deliveryLabel: string
): BankDepositConfig {
  if (deliveryLabel === "Depósito bancario") {
    if (currency === "EUR") return EU_BANK_DEPOSIT_CONFIG;
    return BANK_DEPOSIT_CONFIG[countryName] ?? DEFAULT_BANK_DEPOSIT_CONFIG;
  }
  if (deliveryLabel === "Retiro en efectivo") {
    return {
      label: "Documento de identidad del destinatario",
      placeholder: "CURP / cédula / DNI",
      showBank: false,
    };
  }
  return {
    label: "Número de la billetera móvil",
    placeholder: "+52 55 1234 5678",
    showBank: false,
  };
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-lime-400/50";

const selectClasses =
  "w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-ink-900 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-lime-400/50";

export default function RecipientForm({
  countryName,
  currency,
  deliveryLabel,
  initialValues,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Recipient>(initialValues);
  const field = referenceFieldConfig(countryName, currency, deliveryLabel);
  const documentTypes = field.documentTypes;

  const update = (key: keyof Recipient) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fixedDocumentType =
      documentTypes && documentTypes.length === 1 ? documentTypes[0].value : values.documentType;
    onSubmit({ ...values, documentType: fixedDocumentType });
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

      {documentTypes && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <IdCard size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            {documentTypes.length > 1 ? (
              <select
                required
                value={values.documentType}
                onChange={update("documentType")}
                className={selectClasses}
              >
                <option value="" disabled>
                  Tipo de documento
                </option>
                {documentTypes.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                readOnly
                value={documentTypes[0].label}
                className={`${inputClasses} cursor-default text-white/60`}
              />
            )}
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
          {field.showAccountType && (
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
          )}
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

      {field.extraField && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/45">
            {field.extraField.label}
          </label>
          <div className="relative">
            <Hash size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              required
              value={values.bankCode}
              onChange={update("bankCode")}
              placeholder={field.extraField.placeholder}
              maxLength={field.extraField.maxLength}
              className={inputClasses}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 py-4 font-display text-base font-bold text-ink-950 transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        Continuar al pago
      </button>
    </form>
  );
}
