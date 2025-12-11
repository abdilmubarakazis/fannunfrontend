"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth.store";
import { toast } from "@/components/Toaster";
import CategoryForm from "./ui/CategoryForm";
import { categories as dummyCategories } from "@/lib/dummy";
import { loadJSON, saveJSON } from "@/lib/localStore";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const [items, setItems] = useState<Category[]>(() => []);

  useEffect(() => {
    setItems(
      loadJSON<Category[]>(
        "admin-categories-v1",
        dummyCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
      )
    );
  }, []);

  useEffect(() => {
    if (items.length) saveJSON("admin-categories-v1", items);
  }, [items]);

  // guard (lebih stabil pakai useEffect)
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/products");
  }, [hydrated, user, router]);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((c) =>
      `${c.name} ${c.slug}`.toLowerCase().includes(query)
    );
  }, [items, q]);

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (c: Category) => {
    setEditing(c);
    setOpen(true);
  };

  const onDelete = (id: number) => {
    const c = items.find((x) => x.id === id);
    if (!confirm(`Hapus kategori "${c?.name ?? ""}" ?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast("🗑️ Category dihapus (dummy)");
  };

  const onSave = (data: Omit<Category, "id">, id?: number) => {
    // slug harus unik
    const slugLower = data.slug.trim().toLowerCase();
    const clash = items.some(
      (c) => c.slug.toLowerCase() === slugLower && c.id !== id
    );
    if (clash) {
      toast("❌ Slug sudah dipakai. Harus unik.");
      return;
    }

    if (id) {
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data, id } : c))
      );
      toast("✅ Category berhasil diupdate (dummy)");
    } else {
      const nextId = Math.max(0, ...items.map((x) => x.id)) + 1;
      setItems((prev) => [{ id: nextId, ...data }, ...prev]);
      toast("✅ Category berhasil ditambahkan (dummy)");
    }

    setOpen(false);
    setEditing(null);
  };

  if (!hydrated) return <div className="text-sm text-gray-600">Loading...</div>;
  if (!user || user.role !== "admin")
    return <div className="text-sm text-gray-600">Redirecting...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">Admin</p>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-600">
            CRUD UI (dummy) — nanti tinggal sambung API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <button
            onClick={onAdd}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            + Add Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border p-4">
        <label className="text-sm font-medium">Search</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2"
          placeholder="Cari nama/slug..."
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Name</div>
          <div className="col-span-5">Slug</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No categories.</div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-12 items-center gap-2 border-t px-4 py-3 text-sm"
            >
              <div className="col-span-1 text-gray-600">{c.id}</div>
              <div className="col-span-4 font-medium">{c.name}</div>
              <div className="col-span-5 text-gray-700">{c.slug}</div>
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => onEdit(c)}
                  className="rounded-lg border px-3 py-2 text-xs hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="rounded-lg border px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {open ? (
        <CategoryForm
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
