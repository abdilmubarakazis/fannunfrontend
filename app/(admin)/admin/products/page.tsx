"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, products as dummyProducts } from "@/lib/dummy";
import type { Product } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { useAuth } from "@/lib/auth.store";
import { toast } from "@/components/Toaster";
import ProductForm from "./ui/ProductForm";
import { loadJSON, saveJSON } from "@/lib/localStore";

type Sort = "name_asc" | "price_asc" | "price_desc";

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-xl px-2 py-1 text-[11px] font-semibold",
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-gray-100 text-gray-700",
      ].join(" ")}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);

  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("name_asc");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // load initial
  useEffect(() => {
    setItems(loadJSON<Product[]>("admin-products-v1", [...dummyProducts]));
  }, []);

  // persist
  useEffect(() => {
    saveJSON("admin-products-v1", items);
  }, [items]);

  // guard
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/products");
  }, [hydrated, user, router]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const catId =
      cat === "all" ? null : categories.find((c) => c.slug === cat)?.id ?? null;

    let list = items
      .filter((p) => (activeOnly ? p.isActive : true))
      .filter((p) => (catId ? p.categoryId === catId : true))
      .filter((p) => {
        if (!query) return true;
        const hay = `${p.name} ${p.description ?? ""} ${p.slug}`.toLowerCase();
        return hay.includes(query);
      });

    list = [...list];
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
      default:
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [items, q, cat, activeOnly, sort]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((p) => p.isActive).length;
    const inactive = total - active;
    const lowStock = items.filter(
      (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5
    ).length;
    return { total, active, inactive, lowStock };
  }, [items]);

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setOpen(true);
  };

  const onSave = (data: Omit<Product, "id">, id?: number) => {
    if (id) {
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data, id } : p))
      );
      toast("✅ Produk berhasil diupdate (dummy)");
    } else {
      const nextId = Math.max(0, ...items.map((x) => x.id)) + 1;
      setItems((prev) => [{ ...data, id: nextId }, ...prev]);
      toast("✅ Produk berhasil ditambahkan (dummy)");
    }
    setOpen(false);
    setEditing(null);
  };

  const onDelete = (id: number) => {
    const p = items.find((x) => x.id === id);
    if (!confirm(`Hapus produk "${p?.name ?? ""}" ?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast("🗑️ Produk dihapus (dummy)");
  };

  const onReset = () => {
    setQ("");
    setCat("all");
    setSort("name_asc");
    setActiveOnly(false);
  };

  if (!hydrated)
    return <div className="p-6 text-sm text-[#6B7280]">Loading...</div>;
  if (!user || user.role !== "admin")
    return <div className="p-6 text-sm text-[#6B7280]">Redirecting...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">
              Admin / Products
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#111827]">
              Products
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              CRUD UI (dummy) — nanti tinggal sambung API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
            >
              ← Dashboard
            </Link>

            <button
              onClick={openAdd}
              className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* quick stats */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#EEF0F6] bg-[#F7F8FF] p-4">
            <p className="text-xs text-[#6B7280]">Total products</p>
            <p className="mt-1 text-xl font-semibold text-[#111827]">
              {stats.total}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EEF0F6] bg-[#F7F8FF] p-4">
            <p className="text-xs text-[#6B7280]">Active</p>
            <p className="mt-1 text-xl font-semibold text-[#111827]">
              {stats.active}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EEF0F6] bg-[#F7F8FF] p-4">
            <p className="text-xs text-[#6B7280]">Inactive</p>
            <p className="mt-1 text-xl font-semibold text-[#111827]">
              {stats.inactive}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EEF0F6] bg-[#F7F8FF] p-4">
            <p className="text-xs text-[#6B7280]">Low stock (≤ 5)</p>
            <p className="mt-1 text-xl font-semibold text-[#111827]">
              {stats.lowStock}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6B7280]">
              Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-black"
              placeholder="Cari nama/desc/slug..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6B7280]">
              Category
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-black"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6B7280]">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-black"
            >
              <option value="name_asc">Name A→Z</option>
              <option value="price_asc">Price Low→High</option>
              <option value="price_desc">Price High→Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex select-none items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827]">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="h-4 w-4"
              />
              Active only
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              onClick={onReset}
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            >
              Reset filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-[#EEF0F6] bg-white">
        <div className="grid grid-cols-12 bg-[#F9FAFB] px-4 py-3 text-xs font-semibold text-[#6B7280]">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Stock</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-[#6B7280]">No products.</div>
        ) : (
          filtered.map((p) => {
            const c = categories.find((x) => x.id === p.categoryId);
            return (
              <div
                key={p.id}
                className="grid grid-cols-12 items-center gap-2 border-t border-[#EEF0F6] px-4 py-3 text-sm"
              >
                <div className="col-span-5 min-w-0">
                  <p className="truncate font-semibold text-[#111827]">
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">{p.slug}</p>
                </div>

                <div className="col-span-2 text-[#374151]">
                  {c?.name ?? "-"}
                </div>

                <div className="col-span-2 font-semibold text-[#111827]">
                  {formatIDR(p.price)}
                </div>

                <div className="col-span-1 text-[#111827]">
                  {p.stock ?? "-"}
                </div>

                <div className="col-span-1">
                  <StatusPill active={!!p.isActive} />
                </div>

                <div className="col-span-1 flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="rounded-2xl border border-[#FEE2E2] bg-[#FFF1F2] px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-[#FFE4E6]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {open ? (
        <ProductForm
          initial={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={onSave}
        />
      ) : null}
    </div>
  );
}
