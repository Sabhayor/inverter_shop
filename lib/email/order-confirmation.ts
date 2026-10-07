type OrderMail = {
  to: string;
  name: string;
  orderNumber: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  city: string;
  state: string;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[character] ?? character));

const money = (value: number) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(value);

export async function sendOrderConfirmation(order: OrderMail): Promise<boolean> {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL, MAILGUN_API_BASE_URL } = process.env;
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM_EMAIL) {
    console.warn("Order email not sent: Mailgun is not configured");
    return false;
  }

  const apiBaseUrl = (MAILGUN_API_BASE_URL || "https://api.mailgun.net").replace(/\/$/, "");
  const recipient = escapeHtml(order.to);
  const name = escapeHtml(order.name);
  const address = [order.address, order.city, order.state, "Nigeria"].map(escapeHtml).join(", ");
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;line-height:1.5">${escapeHtml(item.name)}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#4b5563;text-align:center;font-size:14px">${item.quantity}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e7eb;color:#111827;text-align:right;font-size:14px;font-weight:700">${money(item.unitPrice * item.quantity)}</td>
    </tr>`).join("");
  const textItems = order.items.map((item) => `${item.name} x ${item.quantity} — ${money(item.unitPrice * item.quantity)}`).join("\n");
  const text = [
    `Hello ${order.name},`,
    "",
    `We have received your order ${order.orderNumber}.`,
    "",
    textItems,
    "",
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${money(order.deliveryFee)}`,
    `Total: ${money(order.total)}`,
    "",
    `Delivery address: ${order.address}, ${order.city}, ${order.state}, Nigeria`,
    "",
    "Payment is pending. Our team will contact you with the next steps.",
    "",
    "NASKAM Commercial Enterprises",
  ].join("\n");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#111827">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">Order ${escapeHtml(order.orderNumber)} has been received by NASKAM Commercial Enterprises.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fa;padding:28px 12px"><tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <tr><td style="background:#071b5c;padding:24px 30px;color:#ffffff">
        <p style="margin:0;color:#dbeafe;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">NASKAM Commercial Enterprises</p>
        <h1 style="margin:10px 0 0;font-size:25px;line-height:1.25">Order received</h1>
      </td></tr>
      <tr><td style="padding:28px 30px 10px">
        <p style="margin:0 0 12px;font-size:16px">Hello ${name},</p>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7">Thank you for choosing NASKAM. We have received your order and our team will contact you about the next steps.</p>
        <div style="margin:22px 0;padding:15px 17px;border:1px solid #dbe3f0;border-radius:8px;background:#f8fafc">
          <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Order number</p>
          <p style="margin:6px 0 0;color:#071b5c;font-size:18px;font-weight:700">${escapeHtml(order.orderNumber)}</p>
        </div>
        <h2 style="margin:24px 0 10px;color:#071b5c;font-size:16px">Order summary</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
          <thead><tr><th align="left" style="padding:10px 12px;background:#f5f7fa;color:#4b5563;font-size:11px;text-transform:uppercase">Item</th><th align="center" style="padding:10px 12px;background:#f5f7fa;color:#4b5563;font-size:11px;text-transform:uppercase">Qty</th><th align="right" style="padding:10px 12px;background:#f5f7fa;color:#4b5563;font-size:11px;text-transform:uppercase">Amount</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px">
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Subtotal</td><td align="right" style="padding:6px 0;font-size:14px">${money(order.subtotal)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Delivery</td><td align="right" style="padding:6px 0;font-size:14px">${money(order.deliveryFee)}</td></tr>
          <tr><td style="padding:13px 0;border-top:1px solid #e5e7eb;color:#071b5c;font-size:16px;font-weight:700">Total</td><td align="right" style="padding:13px 0;border-top:1px solid #e5e7eb;color:#d71920;font-size:18px;font-weight:700">${money(order.total)}</td></tr>
        </table>
        <h2 style="margin:24px 0 8px;color:#071b5c;font-size:16px">Delivery address</h2>
        <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.7">${address}</p>
        <p style="margin:22px 0 0;padding:13px 15px;border-left:3px solid #d71920;background:#fff7f7;color:#4b5563;font-size:13px;line-height:1.6"><strong style="color:#111827">Payment status: Pending.</strong> Payment has not been collected online. Our team will contact you with the next steps.</p>
      </td></tr>
      <tr><td style="padding:22px 30px;background:#f5f7fa;color:#6b7280;font-size:12px;line-height:1.6">NASKAM Commercial Enterprises<br>Clean energy. Smart choice. Better tomorrow.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const form = new URLSearchParams({
    from: MAILGUN_FROM_EMAIL,
    to: order.to,
    subject: `Order received — ${order.orderNumber}`,
    text,
    html,
  });
  const response = await fetch(`${apiBaseUrl}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
    cache: "no-store",
  });

  if (!response.ok) {
    // Avoid logging request details or credentials. Mailgun response text contains diagnostic info only.
    console.error("Mailgun order confirmation failed:", response.status, await response.text());
    return false;
  }
  const result = await response.json() as { id?: string; message?: string };
  console.info("Mailgun accepted order confirmation:", { orderNumber: order.orderNumber, id: result.id });
  return true;
}
