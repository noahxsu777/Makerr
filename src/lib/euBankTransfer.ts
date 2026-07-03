// Cuenta bancaria (Reino Unido/Europa) para recibir pagos por transferencia
// de remitentes europeos que no pueden pagar con tarjeta o cuenta de EE.UU.
// vía Stripe. No hay verificación automática: el pago queda "pendiente de
// revisión" igual que el flujo de USDC, hasta confirmar el ingreso a mano.
export const EU_BANK_TRANSFER = {
  bankName: "The Currency Cloud Limited",
  iban: "GB66TCCL00997983645344",
  swiftBic: "TCCLGB31",
  bankAddress: "12 Steward Street, The Steward Building, London, E1 6FQ, GB",
} as const;
