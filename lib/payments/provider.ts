export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type PaymentRequest = { orderId: string; orderNumber: string; amount: number; currency: "NGN"; customerEmail: string };
export type PaymentResult = { status: PaymentStatus; reference?: string; checkoutUrl?: string };

/** Payment providers must return a verified result; starting a checkout is never proof of payment. */
export interface PaymentProvider {
  initiate(request: PaymentRequest): Promise<PaymentResult>;
  verify(reference: string): Promise<PaymentResult>;
}

export const pendingPaymentProvider: PaymentProvider = {
  async initiate() { return { status: "Pending" }; },
  async verify() { return { status: "Pending" }; },
};
