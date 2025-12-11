import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/dummy";

export default function HomePage() {
  const slides = [
    {
      id: "s1",
      image: "/banners/1.jpg",
      title: "Login untuk berbelanja",
      desc: "Masuk dulu untuk mulai checkout dan kelola pesanan.",
      cta: "Login sekarang",
      href: "/login",
    },
    {
      id: "s2",
      image: "/banners/2.jpg",
      title: "Cari produk favoritmu",
      desc: "Gunakan search & filter untuk menemukan produk terbaik.",
      cta: "Lihat produk",
      href: "/products",
    },
    {
      id: "s3",
      image: "/banners/3.jpg",
      title: "Checkout cepat (dummy)",
      desc: "Nanti kita sambungkan ke backend + Midtrans.",
      cta: "Mulai checkout",
      href: "/checkout",
    },
  ];

  const featured = products.filter((p) => p.isActive).slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">SHOP</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
              Temukan fashion favoritmu
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Banner slider + rekomendasi produk (dummy).
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
            >
              Jelajahi Produk →
            </Link>
          </div>
        </div>

        <HeroSlider slides={slides} intervalMs={3500} />
      </section>

      {/* Featured */}
      <section className="space-y-3">
        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#6B7280]">PILIHAN</p>
              <h2 className="text-lg font-semibold text-[#111827]">
                Rekomendasi Produk
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Produk yang lagi banyak dilihat (dummy).
              </p>
            </div>

            <Link
              href="/products"
              className="text-sm font-semibold text-[#4F46E5] hover:underline"
            >
              Lihat semua
            </Link>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-3xl border border-[#EEF0F6] bg-white p-8 text-center text-sm text-[#6B7280]">
            Belum ada produk aktif.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
