"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCart } from "./cart-provider";

export function SignOutButton() {
  const router = useRouter();
  const { clear, lines } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError("Sign out is unavailable right now. Please try again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const cartResponse = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity })) }),
      });
      if (!cartResponse.ok) {
        setError("We could not save your cart before signing out. Please try again.");
        return;
      }
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Sign out failed:", signOutError.message);
        setError("We could not sign you out. Please try again.");
        return;
      }
      clear();
      router.replace("/");
      router.refresh();
    } catch (signOutError) {
      console.error("Sign out request failed:", signOutError);
      setError("We could not sign you out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex flex-col items-end gap-2">
    <button type="button" onClick={signOut} disabled={busy} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold disabled:opacity-60">{busy ? "Signing out…" : "Sign out"}</button>
    {error && <p role="alert" className="text-sm text-red">{error}</p>}
  </div>;
}
