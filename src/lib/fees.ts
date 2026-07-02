export const MIN_SEND_USD = 10;
export const MAX_SEND_USD = 2500;

export function getTransferFee(amountUsd: number): number {
  if (amountUsd <= 1000) return 2.99;
  return 15;
}

export function getTotalCharge(amountUsd: number): number {
  return amountUsd + getTransferFee(amountUsd);
}
