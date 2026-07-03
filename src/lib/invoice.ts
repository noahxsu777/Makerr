export type Invoice = {
  invoiceNumber: string;
  issuedAt: string;
  amount: number;
  fee: number;
  total: number;
  currency: string;
  countryName: string;
  deliveryMethod: string;
  paymentMethod: string;
  recipientName: string;
  recipientReference: string;
  orderReference: string;
};
