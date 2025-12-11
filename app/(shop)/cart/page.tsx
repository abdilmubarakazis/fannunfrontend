"use client";

"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useCart } from "@/lib/cart.store";
import { formatIDR } from "@/lib/format";

// kalau store kamu belum ada inc/dec

export default function CartPage() {
  const itemsRaw = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const totalPrice = useCart((s) => s.totalPrice);

  // ✅ DEFENSIVE: pastikan array + filter item yang rusak (legacy localStorage)
  const items = Array.isArray(itemsRaw)
    ? itemsRaw
        .filter(Boolean)
        .filter((it: any) => it && (it.key || it.productId))
    : [];

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#111827]">Cart</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Keranjang kamu kosong.</p>
        <Link
          href="/products"
          className="mt-4 inline-flex rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
        >
          Belanja dulu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">Cart</h1>
            <p className="mt-1 text-sm text-[#6B7280]">{items.length} item</p>
          </div>

          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-rose-600 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it: any, index: number) => {
          // ✅ fallback untuk data lama yang belum punya "key"
          const key = String(
            it.key ??
              `${it.productId ?? "x"}::${it.variant?.color ?? ""}::${
                it.variant?.size ?? ""
              }::${index}`
          );

          const variantText = [
            it.variant?.color ? `Warna: ${it.variant.color}` : null,
            it.variant?.size ? `Ukuran: ${it.variant.size}` : null,
          ]
            .filter(Boolean)
            .join(" • ");

          const imgSrc =
            typeof it.image === "string" && it.image.length > 0
              ? it.image
              : "/placeholder.png";

          return (
            <div
              key={key}
              className="rounded-3xl border border-[#EEF0F6] bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-[#EEF0F6] bg-[#F7F8FF]">
                    <Image
                      src={imgSrc}
                      alt={String(it.name ?? "Product")}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {String(it.name ?? "Product")}
                    </p>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {formatIDR(Number(it.price ?? 0))}
                    </p>
                    {variantText ? (
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {variantText}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-2 py-2">
                    <button
                      type="button"
                      onClick={() => dec(key)}
                      className="grid h-9 w-9 place-items-center rounded-2xl bg-white hover:bg-[#F7F8FF]"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-[#111827]">
                      {Number(it.qty ?? 1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => inc(key)}
                      className="grid h-9 w-9 place-items-center rounded-2xl bg-white hover:bg-[#F7F8FF]"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(key)}
                    className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#6B7280]">Total</p>
            <p className="mt-1 text-2xl font-semibold text-[#111827]">
              {formatIDR(typeof totalPrice === "number" ? totalPrice : 0)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="inline-flex justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
