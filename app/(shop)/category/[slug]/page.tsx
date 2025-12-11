import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/dummy";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = categories.find((c) => c.slug === slug);
  if (!category) return notFound();

  const list = products.filter(
    (p) => p.isActive && p.categoryId === category.id
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: category.name },
        ]}
      />

      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-[#6B7280]">Category</p>
            <h1 className="text-2xl font-semibold text-[#111827]">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              {list.length} produk tersedia
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
          >
            ← Back to Products
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-8 text-center text-sm text-[#6B7280]">
          Belum ada produk di kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
