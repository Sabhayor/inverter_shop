"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/products/types";
import { ProductCard } from "./product-card";

export function ShopCatalog({ products }: { products: Product[] }) {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("All products");
  const [availability, setAvailability] = useState("Any availability");
  const [price, setPrice] = useState("Any price");
  const categories = ["All products", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = useMemo(() => products.filter((product) => {
    const categoryMatches = category === "All products" || product.category === category;
    const availabilityMatches = availability === "Any availability" || (availability === "In stock" ? product.stock_quantity > 0 : product.stock_quantity === 0);
    const priceMatches = price === "Any price" || (price === "Contact for price" ? product.price === 0 : price === "Under ₦500,000" ? product.price > 0 && product.price < 500000 : product.price >= 500000);
    const searchMatches = `${product.name} ${product.brand} ${product.short_description}`.toLowerCase().includes(term.toLowerCase());
    return categoryMatches && availabilityMatches && priceMatches && searchMatches;
  }), [products, term, category, availability, price]);

  return <>
    <div className="mt-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="relative lg:col-span-1"><span className="sr-only">Search products</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search products" className="h-12 w-full rounded-md border border-slate-200 pl-10 pr-3 outline-none focus:border-navy focus:ring-2 focus:ring-blue-100"/></label>
      <label><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 font-semibold text-slate-700 outline-none focus:border-navy">{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label><span className="sr-only">Filter by availability</span><select value={availability} onChange={(event) => setAvailability(event.target.value)} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 font-semibold text-slate-700 outline-none focus:border-navy"><option>Any availability</option><option>In stock</option><option>Unavailable</option></select></label>
      <label><span className="sr-only">Filter by price</span><select value={price} onChange={(event) => setPrice(event.target.value)} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 font-semibold text-slate-700 outline-none focus:border-navy"><option>Any price</option><option>Contact for price</option><option>Under ₦500,000</option><option>₦500,000 and above</option></select></label>
    </div>
    {filtered.length === 0 ? <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center"><h2 className="font-bold text-slate-900">No matching products</h2><p className="mt-2 text-sm text-slate-500">Try another search or category.</p></div> : <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product}/>)}</div>}
  </>;
}
