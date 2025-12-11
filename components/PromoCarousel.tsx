"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";

type PromoItem = {
  id: string;
  title: string;
  href: string;
  image: string;
  discount?: number; // %
  tag?: string; // contoh: "Promo 12.12"
};

export default function PromoCarousel({
  title = "Cek Promo Lainnya!",
  items,
}: {
  title?: string;
  items: PromoItem[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link
          href="/products"
          className="text-sm text-gray-600 hover:underline"
        >
          Lihat semua
        </Link>
      </div>

      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-2",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((p) => (
          <Link key={p.id} href={p.href} className="group w-[220px] flex-none">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="relative aspect-[4/3] bg-gray-50">
                {p.discount != null ? (
                  <div className="absolute left-2 top-2 z-10 rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    {p.discount}%
                  </div>
                ) : null}

                {p.tag ? (
                  <div className="absolute left-2 bottom-2 z-10 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">
                    {p.tag}
                  </div>
                ) : null}

                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="220px"
                />
              </div>

              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
