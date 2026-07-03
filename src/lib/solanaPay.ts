// USDC (mint oficial de Circle en Solana mainnet).
// https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC_MINT_SOLANA = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const RECEIVE_ADDRESS = import.meta.env.VITE_SOLANA_USDC_ADDRESS as
  | string
  | undefined;

export const isSolanaPayConfigured = Boolean(RECEIVE_ADDRESS);
export const solanaReceiveAddress = RECEIVE_ADDRESS ?? "";

// Construye un Solana Pay URI (spec: https://docs.solanapay.com) con el
// monto y el token ya prellenados, para que al escanear el QR la wallet
// del destinatario abra directo la pantalla de "enviar X USDC a Y".
export function buildSolanaPayUrl({
  amountUsd,
  reference,
  label = "Lukea",
  message,
}: {
  amountUsd: number;
  reference?: string;
  label?: string;
  message?: string;
}): string {
  const params = new URLSearchParams();
  params.set("amount", amountUsd.toFixed(2));
  params.set("spl-token", USDC_MINT_SOLANA);
  params.set("label", label);
  if (message) params.set("message", message);
  if (reference) params.set("reference", reference);

  return `solana:${solanaReceiveAddress}?${params.toString()}`;
}
