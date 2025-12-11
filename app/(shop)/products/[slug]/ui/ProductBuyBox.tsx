"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import AddToCartPanel, { type SelectedVariant } from "./AddToCartPanel";
import VariantPicker from "./VariantPicker";
import SizeChartModal from "./SizeChartModal";

export default function ProductBuyBox({ product }: { product: Product }) {
  const [selected, setSelected] = useState<SelectedVariant>({
    color: null,
    size: null,
  });

  const [openSizeChart, setOpenSizeChart] = useState(false);
  const hasSizes = (product.sizes?.length ?? 0) > 0;

  const sizeChartImage = useMemo(
    () => ((product as any).sizeChartImage ?? null) as string | null,
    [product]
  );

  return (
    <div className="space-y-4">
      <VariantPicker
        product={product}
        color={selected.color}
        size={selected.size}
        onChange={(next) => setSelected((s) => ({ ...s, ...next }))}
      />

      {hasSizes ? (
        <button
          type="button"
          onClick={() => setOpenSizeChart(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
        >
          Tabel Ukuran <span className="text-[#9CA3AF]">→</span>
        </button>
      ) : null}

      <AddToCartPanel product={product} selected={selected} />

      <SizeChartModal
        open={openSizeChart}
        onClose={() => setOpenSizeChart(false)}
        image={sizeChartImage}
      />
    </div>
  );
}
