"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductGallery from "./ProductGallery";
import VariantPicker from "./VariantPicker";
import AddToCartPanel from "./AddToCartPanel";
import type { SelectedVariant } from "./type";
import SizeChartModal from "./SizeChartModal";

export default function ProductClientView({ product }: { product: Product }) {
  const [selected, setSelected] = useState<SelectedVariant>({
    color: null,
    size: null,
  });
  const [openSizeChart, setOpenSizeChart] = useState(false);

  const hasSizes = (product.sizes?.length ?? 0) > 0;

  const galleryImages = useMemo(() => {
    const colorImages = ((product as any).colorImages ?? null) as Record<
      string,
      string[]
    > | null;

    const images = ((product as any).images ?? null) as string[] | null;

    const byColor =
      selected.color && colorImages ? colorImages[selected.color] : null;

    const list =
      (byColor && byColor.length ? byColor : null) ??
      (images && images.length ? images : null) ??
      (product.image ? [product.image] : []);

    return list.filter(
      (x): x is string => typeof x === "string" && x.length > 0
    );
  }, [product, selected.color]);

  const sizeChartImage = useMemo(() => {
    return ((product as any).sizeChartImage ?? null) as string | null;
  }, [product]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left: gallery */}
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-3">
        <ProductGallery images={galleryImages} alt={product.name} />
      </div>

      {/* Right: variants + buy box */}
      <div className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
          <VariantPicker
            product={product}
            color={selected.color}
            size={selected.size}
            onChange={(next) => setSelected((s) => ({ ...s, ...next }))}
          />

          {hasSizes ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setOpenSizeChart(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
              >
                Tabel Ukuran <span className="text-[#9CA3AF]">→</span>
              </button>
            </div>
          ) : null}

          <div className="mt-4">
            <AddToCartPanel product={product} selected={selected} />
          </div>
        </div>

        <SizeChartModal
          open={openSizeChart}
          onClose={() => setOpenSizeChart(false)}
          image={sizeChartImage}
        />
      </div>
    </div>
  );
}
