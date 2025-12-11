"use client";

import type { Product } from "@/lib/types";

export default function VariantPicker({
  product,
  color,
  size,
  onChange,
}: {
  product: Product;
  color: string | null;
  size: string | null;
  onChange: (next: { color?: string | null; size?: string | null }) => void;
}) {
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];

  if (colors.length === 0 && sizes.length === 0) return null;

  return (
    <div className="space-y-4">
      {colors.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#111827]">Warna</p>
            <p className="text-xs text-[#6B7280]">
              {color ? `Dipilih: ${color}` : "Pilih warna"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const active = c === color;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ color: active ? null : c })}
                  className={[
                    "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "border-black bg-black text-white"
                      : "border-[#EEF0F6] bg-white text-[#111827] hover:bg-[#F7F8FF]",
                  ].join(" ")}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#111827]">Ukuran</p>
            <p className="text-xs text-[#6B7280]">
              {size ? `Dipilih: ${size}` : "Pilih ukuran"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ size: active ? null : s })}
                  className={[
                    "min-w-[56px] rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4338CA]"
                      : "border-[#EEF0F6] bg-white text-[#111827] hover:bg-[#F7F8FF]",
                  ].join(" ")}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
