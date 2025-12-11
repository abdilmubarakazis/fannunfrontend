"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { categories } from "@/lib/dummy";
import { cn } from "@/components/ui/cn";

type Props = {
  initial: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, "id">, id?: number) => void;
};

type FormState = {
  name: string;
  slug: string;
  categoryId: number;
  price: number;
  stock: number | null;
  isActive: boolean;

  description: string;
  image: string;

  // fashion extras
  colors: string; // comma separated
  sizes: string; // comma separated
  longDescription: string;

  images: string; // comma separated
  sizeChartImage: string;

  // colorImages JSON string
  colorImages: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductForm({ initial, onClose, onSave }: Props) {
  const isEdit = !!initial;

  const [state, setState] = useState<FormState>(() => ({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? 1,
    price: initial?.price ?? 0,
    stock:
      typeof initial?.stock === "number"
        ? initial!.stock
        : initial?.stock ?? null,
    isActive: initial?.isActive ?? true,

    description: initial?.description ?? "",
    image: (initial?.image as any) ?? "",

    colors: ((initial as any)?.colors ?? []).join(", "),
    sizes: ((initial as any)?.sizes ?? []).join(", "),
    longDescription: ((initial as any)?.longDescription ?? "") as string,

    images: ((initial as any)?.images ?? []).join(", "),
    sizeChartImage: ((initial as any)?.sizeChartImage ?? "") as string,

    colorImages: (() => {
      const ci = (initial as any)?.colorImages;
      if (!ci) return "";
      try {
        return JSON.stringify(ci, null, 2);
      } catch {
        return "";
      }
    })(),
  }));

  // auto slug on name change (only if user hasn't typed custom slug)
  const autoSlug = useMemo(() => slugify(state.name), [state.name]);
  useEffect(() => {
    if (isEdit) return;
    setState((s) => {
      if (s.slug.trim().length > 0) return s;
      return { ...s, slug: autoSlug };
    });
  }, [autoSlug, isEdit]);

  const parsed = useMemo(() => {
    const splitList = (s: string) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    let colorImages: Record<string, string[]> | undefined = undefined;
    if (state.colorImages.trim()) {
      try {
        const obj = JSON.parse(state.colorImages);
        // very light validation
        if (obj && typeof obj === "object") colorImages = obj;
      } catch {
        // ignore, will show error in UI
      }
    }

    return {
      colors: splitList(state.colors),
      sizes: splitList(state.sizes),
      images: splitList(state.images),
      colorImages,
      colorImagesValid:
        !state.colorImages.trim() ||
        (() => {
          try {
            JSON.parse(state.colorImages);
            return true;
          } catch {
            return false;
          }
        })(),
    };
  }, [state.colors, state.sizes, state.images, state.colorImages]);

  const canSave =
    state.name.trim().length >= 2 &&
    state.slug.trim().length >= 2 &&
    state.price >= 0 &&
    parsed.colorImagesValid;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const data: Omit<Product, "id"> = {
      name: state.name.trim(),
      slug: state.slug.trim(),
      categoryId: Number(state.categoryId),
      price: Number(state.price),
      stock: state.stock == null ? null : Number(state.stock),
      isActive: !!state.isActive,
      description: state.description.trim() || undefined,
      image: state.image.trim() ? state.image.trim() : null,
    } as any;

    // attach extras only if present
    const extras: any = {};
    if (parsed.colors.length) extras.colors = parsed.colors;
    if (parsed.sizes.length) extras.sizes = parsed.sizes;
    if (state.longDescription.trim())
      extras.longDescription = state.longDescription.trim();
    if (parsed.images.length) extras.images = parsed.images;
    if (state.sizeChartImage.trim())
      extras.sizeChartImage = state.sizeChartImage.trim();
    if (parsed.colorImages) extras.colorImages = parsed.colorImages;

    onSave({ ...(data as any), ...extras }, initial?.id);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#EEF0F6] bg-white shadow-[0_30px_80px_-40px_rgba(17,24,39,0.45)]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[#EEF0F6] px-5 py-4">
          <div>
            <p className="text-xs text-[#6B7280]">Admin • Products</p>
            <h2 className="text-lg font-semibold text-[#111827]">
              {isEdit ? "Edit Product" : "Add Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="max-h-[78vh] overflow-auto p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* left */}
            <div className="space-y-4">
              <Field label="Name">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.name}
                  onChange={(e) =>
                    setState((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Kaos Oversize"
                />
              </Field>

              <Field label="Slug">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.slug}
                  onChange={(e) =>
                    setState((s) => ({ ...s, slug: slugify(e.target.value) }))
                  }
                  placeholder="kaos-oversize"
                />
                {!isEdit ? (
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Tip: kosongkan slug untuk auto-generate dari name.
                  </p>
                ) : null}
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select
                    className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    value={state.categoryId}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        categoryId: Number(e.target.value),
                      }))
                    }
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Price (IDR)">
                  <input
                    className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    type="number"
                    value={state.price}
                    onChange={(e) =>
                      setState((s) => ({ ...s, price: Number(e.target.value) }))
                    }
                    min={0}
                  />
                </Field>

                <Field label="Stock">
                  <input
                    className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    type="number"
                    value={state.stock ?? ""}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        stock:
                          e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                    min={0}
                    placeholder="32"
                  />
                </Field>

                <Field label="Active">
                  <button
                    type="button"
                    onClick={() =>
                      setState((s) => ({ ...s, isActive: !s.isActive }))
                    }
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      state.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-[#EEF0F6] bg-white text-[#111827] hover:bg-[#F9FAFB]"
                    )}
                  >
                    {state.isActive ? "ACTIVE" : "INACTIVE"}
                  </button>
                </Field>
              </div>

              <Field label="Short description">
                <textarea
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  rows={3}
                  value={state.description}
                  onChange={(e) =>
                    setState((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder="Bahan adem, cutting modern."
                />
              </Field>

              <Field label="Main image (url/path)">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.image}
                  onChange={(e) =>
                    setState((s) => ({ ...s, image: e.target.value }))
                  }
                  placeholder="/products/kaos/1.jpg"
                />
              </Field>
            </div>

            {/* right */}
            <div className="space-y-4">
              <div className="rounded-3xl border border-[#EEF0F6] bg-[#F7F8FF] p-4">
                <p className="text-sm font-semibold text-[#111827]">
                  Fashion extras (opsional)
                </p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Isi kalau produk fashion: warna/ukuran, multi foto, size
                  chart, dll.
                </p>
              </div>

              <Field label="Colors (comma separated)">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.colors}
                  onChange={(e) =>
                    setState((s) => ({ ...s, colors: e.target.value }))
                  }
                  placeholder="Cream, Putih, Hitam"
                />
              </Field>

              <Field label="Sizes (comma separated)">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.sizes}
                  onChange={(e) =>
                    setState((s) => ({ ...s, sizes: e.target.value }))
                  }
                  placeholder="M, L, XL, 2XL"
                />
              </Field>

              <Field label="Images (comma separated)">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.images}
                  onChange={(e) =>
                    setState((s) => ({ ...s, images: e.target.value }))
                  }
                  placeholder="/products/kaos/1.jpg, /products/kaos/2.jpg"
                />
              </Field>

              <Field label="Size chart image (url/path)">
                <input
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  value={state.sizeChartImage}
                  onChange={(e) =>
                    setState((s) => ({ ...s, sizeChartImage: e.target.value }))
                  }
                  placeholder="/size-chart/kaos-oversize.jpg"
                />
              </Field>

              <Field label="Long description">
                <textarea
                  className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                  rows={5}
                  value={state.longDescription}
                  onChange={(e) =>
                    setState((s) => ({ ...s, longDescription: e.target.value }))
                  }
                  placeholder={
                    "Bahan: cotton...\nCutting: oversize...\nPerawatan: ..."
                  }
                />
              </Field>

              <Field label="Color images (JSON) — optional">
                <textarea
                  className={cn(
                    "w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-black",
                    parsed.colorImagesValid
                      ? "border-[#EEF0F6]"
                      : "border-rose-300"
                  )}
                  rows={6}
                  value={state.colorImages}
                  onChange={(e) =>
                    setState((s) => ({ ...s, colorImages: e.target.value }))
                  }
                  placeholder={`{\n  "Cream": ["/products/kaos/cream/1.jpg", "/products/kaos/cream/2.jpg"],\n  "Hitam": ["/products/kaos/hitam/1.jpg"]\n}`}
                />
                {!parsed.colorImagesValid ? (
                  <p className="mt-1 text-xs text-rose-600">
                    JSON tidak valid. Perbaiki dulu biar bisa save.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Format: key = nama warna, value = array path gambar.
                  </p>
                )}
              </Field>
            </div>
          </div>

          {/* footer */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSave}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isEdit ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-[#6B7280]">{label}</label>
      {children}
    </div>
  );
}
