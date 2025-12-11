import Link from "next/link";
import Image from "next/image";
import { formatIDR } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const img =
    (product as any).images?.[0] ?? product.image ?? "/placeholder.png";
  const stock = product.stock ?? 0;
  const out = stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block min-w-0 overflow-hidden rounded-3xl border border-[#EEF0F6] bg-white p-3 transition hover:shadow-[0_12px_30px_-18px_rgba(17,24,39,0.35)]"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#F7F8FF]">
        <div className="relative aspect-square w-full">
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="absolute left-2 top-2 flex items-center gap-2">
          <span
            className={[
              "rounded-xl px-2 py-1 text-[10px] font-semibold",
              out
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700",
            ].join(" ")}
          >
            {out ? "OUT" : "READY"}
          </span>
        </div>
      </div>

      <div className="mt-3 min-w-0 space-y-1">
        <p className="min-w-0 truncate text-sm font-semibold text-[#111827]">
          {product.name}
        </p>

        <p className="min-w-0 truncate text-xs text-[#6B7280]">
          {product.description ?? ""}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="truncate text-sm font-bold text-[#111827]">
            {formatIDR(product.price)}
          </p>

          <span className="shrink-0 text-xs font-semibold text-[#4F46E5] opacity-0 transition group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
