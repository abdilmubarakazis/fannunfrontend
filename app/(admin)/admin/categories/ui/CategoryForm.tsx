"use client";

import { useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type FormData = Omit<Category, "id">;

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoryForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Category | null;
  onClose: () => void;
  onSave: (data: FormData, id?: number) => void;
}) {
  const [form, setForm] = useState<FormData>(() => ({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
  }));

  const isEdit = !!initial;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Nama minimal 2 karakter";
    if (form.slug.trim().length < 2) e.slug = "Slug minimal 2 karakter";
    return e;
  }, [form]);

  const canSave = Object.keys(errors).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <p className="text-sm text-gray-600">Admin Categories</p>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Category" : "Add Category"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: f.slug ? f.slug : slugify(name),
                }));
              }}
              placeholder="Fashion"
            />
            {errors.name ? (
              <p className="text-xs text-red-600">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Slug</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
              }
              placeholder="fashion"
            />
            {errors.slug ? (
              <p className="text-xs text-red-600">{errors.slug}</p>
            ) : null}
            <p className="text-xs text-gray-500">
              Slug otomatis (boleh kamu edit), tapi harus unik.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave(
                { name: form.name.trim(), slug: slugify(form.slug) },
                initial?.id
              )
            }
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isEdit ? "Save changes" : "Create category"}
          </button>
        </div>
      </div>
    </div>
  );
}
