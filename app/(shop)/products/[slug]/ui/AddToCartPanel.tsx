"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart.store";
import { toast } from "@/components/Toaster";
import type { SelectedVariant } from "./types";

export default function AddToCartPanel({
  product,
  selected,
}: {
  product: Product;
  selected?: SelectedVariant;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;

  const [qty, setQty] = useState(1);
  const maxQty = useMemo(() => (stock > 0 ? stock : 1), [stock]);

  const hasColors = (product.colors?.length ?? 0) > 0;
  const hasSizes = (product.sizes?.length ?? 0) > 0;

  // untuk disabled state (tanpa toast)
  const canProceed =
    !outOfStock &&
    (!hasColors || !!selected?.color) &&
    (!hasSizes || !!selected?.size);

  const guardVariant = () => {
    if (outOfStock) return false;

    if (hasColors && !selected?.color) {
      toast("Pilih warna dulu ya.");
      return false;
    }
    if (hasSizes && !selected?.size) {
      toast("Pilih ukuran dulu ya.");
      return false;
    }
    return true;
  };

  const onAdd = () => {
    if (!guardVariant()) return;

    add(product, qty, selected);

    toast(
      `✅ Ditambahkan: ${qty} × ${product.name}${
        selected?.color ? ` • ${selected.color}` : ""
      }${selected?.size ? ` • ${selected.size}` : ""}`
    );
  };

  const onCheckout = () => {
    if (!guardVariant()) return;

    add(product, qty, selected);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* qty */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="rounded-xl border border-[#EEF0F6] bg-white px-3 py-2 hover:bg-[#F9FAFB] disabled:opacity-40"
            disabled={outOfStock}
          >
            -
          </button>

          <input
            value={qty}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isNaN(n)) return;
              setQty(Math.min(Math.max(1, n), maxQty));
            }}
            className="w-16 rounded-xl border border-[#EEF0F6] bg-white px-3 py-2 text-center"
            disabled={outOfStock}
            inputMode="numeric"
          />

          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="rounded-xl border border-[#EEF0F6] bg-white px-3 py-2 hover:bg-[#F9FAFB] disabled:opacity-40"
            disabled={outOfStock}
          >
            +
          </button>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={!canProceed}
            className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to Cart
          </button>

          <button
            type="button"
            onClick={onCheckout}
            disabled={!canProceed}
            className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Checkout Now
          </button>
        </div>
      </div>

      {outOfStock ? <p className="text-xs text-rose-600">Stok habis.</p> : null}
    </div>
  );
}
