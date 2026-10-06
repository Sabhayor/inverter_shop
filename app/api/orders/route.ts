import { NextResponse } from "next/server"; import { getSupabaseServer } from "@/lib/supabase/server"; import { calculateDeliveryFee } from "@/lib/orders/delivery"; import { sendOrderConfirmation } from "@/lib/email/order-confirmation";
import { getSupabaseUser } from "@/lib/supabase/user";
const states = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
export async function POST(request: Request) {
  const supabase = getSupabaseServer(); if (!supabase) return NextResponse.json({ error: "Checkout is not configured yet. Please contact the store." }, { status: 503 });
  try {
    const input = await request.json() as Record<string, unknown>;
    const required = ["firstName","lastName","email","phone","address","city","state","postalCode"];
    if (required.some((field) => typeof input[field] !== "string" || !(input[field] as string).trim()) || typeof input.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || typeof input.state !== "string" || !states.includes(input.state)) return NextResponse.json({ error: "Check your contact and delivery details, then try again." }, { status: 400 });
    if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 40) return NextResponse.json({ error: "Your cart is empty or contains too many items." }, { status: 400 });
    const items = input.items.map((item) => { const row = item as { productId?: unknown; quantity?: unknown }; if (typeof row.productId !== "string" || !Number.isInteger(row.quantity) || (row.quantity as number) < 1 || (row.quantity as number) > 25) throw new Error("invalid_items"); return { product_id: row.productId, quantity: row.quantity as number }; });
    const { data: currentProducts, error: productError } = await supabase.from("products").select("id,price,stock_quantity,is_active").in("id", items.map((item) => item.product_id));
    if (productError) { console.error("Checkout product validation failed:", productError.message); return NextResponse.json({ error: "We could not confirm current product availability. Please try again." }, { status: 503 }); }
    const productById = new Map((currentProducts ?? []).map((product) => [product.id, product]));
    if (items.some((item) => { const product = productById.get(item.product_id); return !product || !product.is_active || product.price <= 0 || product.stock_quantity < item.quantity; })) return NextResponse.json({ error: "A product in your cart needs a confirmed price or is no longer available. Please contact the store." }, { status: 409 });
    let deliveryFee:number;
    try { deliveryFee=calculateDeliveryFee(input.state); }
    catch (deliveryError) { if(deliveryError instanceof Error&&deliveryError.message==="delivery_configuration")return NextResponse.json({error:"Delivery for this location needs to be confirmed. Please contact the store to complete your order."},{status:503});throw deliveryError; }
    const userClient = await getSupabaseUser(); const { data: { user } } = userClient ? await userClient.auth.getUser() : { data: { user: null } };
    const { data, error } = await supabase.rpc("create_customer_order", { p_email: input.email, p_phone: input.phone, p_first_name: input.firstName, p_last_name: input.lastName, p_address: input.address, p_city: input.city, p_state: input.state, p_postal_code: input.postalCode, p_country: "Nigeria", p_delivery_fee: deliveryFee, p_items: items, p_user_id: user?.id ?? null });
    if (error) { console.error("Order creation failed:", error.message); return NextResponse.json({ error: error.message.includes("insufficient_stock") ? "One or more items are no longer available in the requested quantity." : error.message.includes("price_unavailable") ? "A product in your cart needs a confirmed price. Please contact the store." : "We could not place your order. Please try again." }, { status: 400 }); }
    const order = data as { id: string; order_number: string; subtotal: number; delivery_fee: number; total: number; items: { name: string; quantity: number; unit_price: number }[] };
    let emailSent = false;
    try { emailSent = await sendOrderConfirmation({ to: input.email as string, name: `${input.firstName} ${input.lastName}`, orderNumber: order.order_number, items: order.items.map((item) => ({ name: item.name, quantity: item.quantity, unitPrice: item.unit_price })), subtotal: order.subtotal, deliveryFee: order.delivery_fee, total: order.total, address: input.address as string, city: input.city as string, state: input.state as string }); }
    catch (emailError) { console.error("Order was created but confirmation email failed:", emailError); }
    return NextResponse.json({ orderNumber: order.order_number, emailSent });
  } catch (error) { if (error instanceof Error && error.message === "invalid_items") return NextResponse.json({ error: "Please review the quantities in your cart." }, { status: 400 }); console.error("Checkout request failed:", error); return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 }); }
}
