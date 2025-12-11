import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, categories } from "@/lib/dummy";
import { formatIDR } from "@/lib/format";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "./ui/ProductGallery";
import ProductBuyBox from "./ui/ProductBuyBox";

type ProductWithExtras = ReturnType<typeof getProductBySlug> & {
  images?: string[];
  colorImages?: Record<string, string[]>;
  longDescription?: string;
  sizeChartImage?: string;
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const productRaw = getProductBySlug(slug);
  if (!productRaw) return notFound();

  const product = productRaw as ProductWithExtras;

  const category = categories.find((c) => c.id === product.categoryId);
  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;

  // ✅ gallery images fallback (priority):
  // 1) product.images
  // 2) product.image
  // 3) first colorImages if exists
  const images = Array.from(
    new Set(
      [
        ...(product.images ?? []),
        ...(product.image ? [product.image] : []),
        ...Object.values(product.colorImages ?? {}).flat(),
      ].filter(Boolean)
    )
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(category
            ? [{ label: category.name, href: `/category/${category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: gallery */}
        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-3">
          <ProductGallery
            alt={product.name}
            images={images}
            // kalau ProductGallery kamu belum support empty state,
            // minimal images ini sudah aman karena ada fallback dari colorImages
          />
        </div>

        {/* Right: info */}
        <div className="space-y-3 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-[#6B7280]">
                Category:{" "}
                {category ? (
                  <Link
                    href={`/category/${category.slug}`}
                    className="font-semibold text-[#111827] hover:underline"
                  >
                    {category.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#111827]">-</span>
                )}
              </p>

              <span
                className={[
                  "shrink-0 rounded-2xl px-3 py-1 text-xs font-semibold",
                  outOfStock
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700",
                ].join(" ")}
              >
                {outOfStock ? "Out of stock" : `In stock (${stock})`}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-semibold text-[#111827]">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-[#6B7280]">
              {product.description ?? "No short description."}
            </p>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F7F8FF] px-4 py-3">
              <div>
                <p className="text-xs text-[#6B7280]">Price</p>
                <p className="text-xl font-semibold text-[#111827]">
                  {formatIDR(product.price)}
                </p>
              </div>
            </div>

            {/* ✅ IMPORTANT: ini yang munculin VariantPicker + SizeChart + AddToCart */}
            <div className="mt-4">
              <ProductBuyBox product={productRaw} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link
                href="/products"
                className="font-semibold text-[#374151] hover:underline"
              >
                ← Back
              </Link>

              {category ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="font-semibold text-[#4F46E5] hover:underline"
                >
                  View more in {category.name} →
                </Link>
              ) : null}
            </div>
          </div>

          {/* Long description panel */}
          <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#111827]">
              Deskripsi Produk
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm text-[#6B7280]">
              {(product.longDescription as any) ??
                product.description ??
                "Belum ada deskripsi detail untuk produk ini."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
