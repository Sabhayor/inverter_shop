import { getSupabaseServer } from "@/lib/supabase/server";
import type { Product } from "./types";

export async function getProducts(): Promise<{ products: Product[]; configured: boolean }> {
  const supabase = getSupabaseServer();
  if (!supabase) return { products: [], configured: false };
  const { data, error } = await supabase.from("products").select("*, categories(name), product_images(image_url, alt_text, sort_order)").eq("is_active", true).order("created_at", { ascending: false }).limit(24);
  if (error) { console.error("Product query failed:", error.message); return { products: [], configured: true }; }
  return { configured: true, products: (data ?? []).map((row) => ({ ...row, category: row.categories?.name ?? "Power", image_url: row.product_images?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)[0]?.image_url ?? "/images/product-placeholder.svg" })) as Product[] };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.from("products").select("*, categories(name), product_images(image_url, alt_text, sort_order)").eq("is_active", true).eq("slug", slug).maybeSingle();
  if (error) { console.error("Product detail query failed:", error.message); return null; }
  if (!data) return null;
  const images = [...(data.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return { ...data, category: data.categories?.name ?? "Power", image_url: images[0]?.image_url ?? "/images/product-placeholder.svg" } as Product;
}
