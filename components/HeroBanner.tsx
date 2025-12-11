import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <Link
      href="/products"
      className="block overflow-hidden rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50"
    >
      <div className="relative h-[180px] sm:h-[240px]">
        {/* ganti src sesuai gambar banner kamu di public */}
        <Image
          src="/banners/hero.jpg"
          alt="Promo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/10 to-transparent" />
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <p className="text-xs font-semibold text-gray-700">PROMO</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">
            Diskon besar hari ini
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Belanja produk pilihan, harga spesial.
          </p>
          <span className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
            Lihat Produk
          </span>
        </div>
      </div>
    </Link>
  );
}
