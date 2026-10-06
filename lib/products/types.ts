export type Product = {
  id: string; name: string; slug: string; sku: string; brand: string;
  description: string; short_description: string; price: number; compare_at_price: number | null;
  stock_quantity: number; warranty: string | null; specifications: Record<string, string>;
  image_url: string; category: string;
};
