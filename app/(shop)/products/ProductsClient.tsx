"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/lib/dummy";

type Sort = "new" | "price_asc" | "price_desc" | "name_asc";
const PAGE_SIZE = 9;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ProductsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const categorySlug = sp.get("cat") ?? "all";
  const inStockOnly = sp.get("stock") === "1";
  const sort = (sp.get("sort") as Sort) ?? "new";
  const page = Number(sp.get("page") ?? "1") || 1;

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || v === "all") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const catId =
      categorySlug === "all"
        ? null
        : categories.find((c) => c.slug === categorySlug)?.id ?? null;

    let list = products
      .filter((p) => p.isActive)
      .filter((p) => (catId ? p.categoryId === catId : true))
      .filter((p) => {
        if (!query) return true;
        const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
        return hay.includes(query);
      })
      .filter((p) => (inStockOnly ? (p.stock ?? 0) > 0 : true));

    list = [...list];
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [q, categorySlug, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = clamp(page, 1, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-[#6B7280]">Catalog</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111827]">
              Products
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Cari produk fashion favoritmu. Filter tersimpan di URL.
            </p>
          </div>

          <div className="text-sm text-[#6B7280]">
            {filtered.length === 0 ? (
              <>0 produk</>
            ) : (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-[#111827]">
                  {from}-{to}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-[#111827]">
                  {filtered.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label className="text-xs font-semibold text-[#111827]">
              Search
            </label>
            <div className="mt-2 relative">
              <input
                value={q}
                onChange={(e) => setParams({ q: e.target.value, page: "1" })}
                placeholder="Cari produk..."
                className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
                ⌘K
              </span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="text-xs font-semibold text-[#111827]">
              Category
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setParams({ cat: e.target.value, page: "1" })}
              className="mt-2 w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="text-xs font-semibold text-[#111827]">Sort</label>
            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value, page: "1" })}
              className="mt-2 w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="new">Default</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
            </select>
          </div>

          <div className="lg:col-span-1 flex items-end">
            <label className="inline-flex select-none items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) =>
                  setParams({ stock: e.target.checked ? "1" : null, page: "1" })
                }
                className="h-4 w-4 accent-[#7C3AED]"
              />
              Stock
            </label>
          </div>

          <div className="lg:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setParams({ cat: "all", page: "1" })}
                className={[
                  "rounded-2xl border px-3 py-2 text-sm transition",
                  categorySlug === "all"
                    ? "border-transparent bg-[#F2F3FF] text-[#4338CA]"
                    : "border-[#EEF0F6] bg-white text-[#374151] hover:bg-[#F9FAFB]",
                ].join(" ")}
              >
                All
              </button>

              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setParams({ cat: c.slug, page: "1" })}
                  className={[
                    "rounded-2xl border px-3 py-2 text-sm transition",
                    categorySlug === c.slug
                      ? "border-transparent bg-[#F2F3FF] text-[#4338CA]"
                      : "border-[#EEF0F6] bg-white text-[#374151] hover:bg-[#F9FAFB]",
                  ].join(" ")}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-8 text-center text-sm text-[#6B7280]">
          Produk tidak ditemukan. Coba ubah kata kunci atau filter.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {paged.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="text-sm text-[#6B7280]">
              Page{" "}
              <span className="font-semibold text-[#111827]">{safePage}</span> /{" "}
              <span className="font-semibold text-[#111827]">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setParams({
                    page: String(clamp(safePage - 1, 1, totalPages)),
                  })
                }
                disabled={safePage <= 1}
                className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-2 text-sm font-semibold text-[#111827] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F9FAFB]"
              >
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, safePage - 3),
                    Math.max(0, safePage - 3) + 5
                  )
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setParams({ page: String(n) })}
                      className={[
                        "h-10 w-10 rounded-2xl border text-sm font-semibold transition",
                        n === safePage
                          ? "border-transparent bg-[#F2F3FF] text-[#4338CA]"
                          : "border-[#EEF0F6] bg-white text-[#111827] hover:bg-[#F9FAFB]",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setParams({
                    page: String(clamp(safePage + 1, 1, totalPages)),
                  })
                }
                disabled={safePage >= totalPages}
                className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-2 text-sm font-semibold text-[#111827] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#F9FAFB]"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
