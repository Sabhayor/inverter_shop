export function calculateDeliveryFee(state: string): number {
  const configuredFee = Number(process.env.DELIVERY_FEE_NGN);
  const freeStates = (process.env.FREE_DELIVERY_STATES ?? "Ogun,Lagos,Oyo,Osun,Ondo,Ekiti").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (freeStates.includes(state.trim().toLowerCase())) return 0;
  if (!process.env.DELIVERY_FEE_NGN) throw new Error("delivery_configuration");
  if (!Number.isFinite(configuredFee) || configuredFee < 0) throw new Error("Invalid delivery configuration");
  return Math.round(configuredFee);
}
