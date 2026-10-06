type OrderMail = { to: string; name: string; orderNumber: string; items: { name: string; quantity: number; unitPrice: number }[]; subtotal: number; deliveryFee: number; total: number; address: string; city: string; state: string };
export async function sendOrderConfirmation(order: OrderMail) {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env;
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM_EMAIL) { console.warn("Order email not sent: Mailgun is not configured"); return false; }
  const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
  const lines = order.items.map((item) => `${item.name} × ${item.quantity} — ${money(item.unitPrice * item.quantity)}`).join("\n");
  const body = `Hello ${order.name},\n\nWe have received your order ${order.orderNumber}.\n\n${lines}\n\nSubtotal: ${money(order.subtotal)}\nDelivery: ${money(order.deliveryFee)}\nTotal: ${money(order.total)}\n\nDelivery address: ${order.address}, ${order.city}, ${order.state}, Nigeria\n\nPayment is pending. Our team will contact you with the next steps.\n\nNASKAM Commercial Enterprises`;
  const form = new URLSearchParams({ from: MAILGUN_FROM_EMAIL, to: order.to, subject: `Order received — ${order.orderNumber}`, text: body });
  const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: form, cache: "no-store" });
  if (!response.ok) { console.error("Mailgun order confirmation failed:", response.status, await response.text()); return false; }
  return true;
}
