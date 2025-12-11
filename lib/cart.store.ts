import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";
import type { SelectedVariant } from "@/app/(shop)/products/[slug]/ui/types"; // sesuaikan kalau beda

type CartVariant = {
  color?: string | null;
  size?: string | null;
};

export type CartItem = {
  key: string; // unik per variant
  productId: number;
  qty: number;
  price: number;
  name: string;
  image?: string | null;
  slug: string;
  variant?: CartVariant;
};

type CartState = {
  items: CartItem[];

  // derived
  totalPrice: number;

  // actions
  add: (product: Product, qty: number, variant?: SelectedVariant) => void;
  remove: (key: string) => void;

  inc: (key: string) => void;
  dec: (key: string) => void;

  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const makeKey = (productId: number, v?: CartVariant) => {
  const c = v?.color ?? "";
  const s = v?.size ?? "";
  return `${productId}::${c}::${s}`;
};

const calcTotal = (items: CartItem[]) =>
  items.reduce((sum, it) => sum + it.qty * it.price, 0);

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalPrice: 0,

      add: (product, qty, variant) => {
        const v: CartVariant | undefined = variant
          ? { color: variant.color, size: variant.size }
          : undefined;

        const key = makeKey(product.id, v);

        set((state) => {
          const found = state.items.find((it) => it.key === key);

          let nextItems: CartItem[];
          if (found) {
            nextItems = state.items.map((it) =>
              it.key === key ? { ...it, qty: it.qty + Math.max(1, qty) } : it
            );
          } else {
            const img = (product as any).images?.[0] ?? product.image ?? null;

            const next: CartItem = {
              key,
              productId: product.id,
              qty: Math.max(1, qty),
              price: product.price,
              name: product.name,
              slug: product.slug,
              image: img,
              variant: v,
            };

            nextItems = [next, ...state.items];
          }

          return { items: nextItems, totalPrice: calcTotal(nextItems) };
        });
      },

      remove: (key) =>
        set((state) => {
          const nextItems = state.items.filter((it) => it.key !== key);
          return { items: nextItems, totalPrice: calcTotal(nextItems) };
        }),

      inc: (key) =>
        set((state) => {
          const nextItems = state.items.map((it) =>
            it.key === key ? { ...it, qty: it.qty + 1 } : it
          );
          return { items: nextItems, totalPrice: calcTotal(nextItems) };
        }),

      dec: (key) =>
        set((state) => {
          const nextItems = state.items.map((it) =>
            it.key === key ? { ...it, qty: Math.max(1, it.qty - 1) } : it
          );
          return { items: nextItems, totalPrice: calcTotal(nextItems) };
        }),

      setQty: (key, qty) =>
        set((state) => {
          const nextItems = state.items.map((it) =>
            it.key === key ? { ...it, qty: Math.max(1, qty) } : it
          );
          return { items: nextItems, totalPrice: calcTotal(nextItems) };
        }),

      clear: () => set({ items: [], totalPrice: 0 }),
    }),
    {
      name: "ecommerce-cart-v1",
      partialize: (s) => ({ items: s.items }), // totalPrice dihitung ulang saat hydrate via set di atas? kita amanin di runtime
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // saat hydrate, totalPrice mungkin 0 — hitung ulang dari items
        state.totalPrice = calcTotal(state.items);
      },
    }
  )
);
