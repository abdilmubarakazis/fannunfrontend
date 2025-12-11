"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart.store";
import { categories } from "@/lib/dummy";
import { useAuth } from "@/lib/auth.store";

export default function Navbar() {
  const router = useRouter();

  const hydrated = useCart((s) => s.hydrated);
  const totalQty = useCart((s) => s.totalQty());

  const authHydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const canAdmin = authHydrated && user?.role === "admin";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(
      query ? `/products?q=${encodeURIComponent(query)}&page=1` : "/products"
    );
  };

  const firstLetter = useMemo(
    () => user?.name?.slice(0, 1)?.toUpperCase() ?? "U",
    [user?.name]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#EEF0F6] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 p-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-sm font-bold text-white">
            EC
          </span>
          <span className="hidden text-sm font-semibold text-[#111827] sm:block">
            E-Commerce
          </span>
        </Link>

        {/* Search */}
        <form
          onSubmit={submitSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative w-full">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
              ⌘K
            </span>
          </div>
          <button
            type="submit"
            className="hidden rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90 sm:inline-flex"
          >
            Search
          </button>
        </form>

        {/* Nav */}
        <nav className="relative flex items-center gap-2 text-sm">
          <Link
            href="/products"
            className="hidden rounded-2xl border border-transparent px-3 py-2 font-medium text-[#374151] hover:bg-white sm:inline-flex"
          >
            Products
          </Link>

          {/* Categories dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            >
              Categories <span className="text-[#9CA3AF]">▾</span>
            </button>

            {open ? (
              <div
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#EEF0F6] bg-white shadow-sm"
                onMouseLeave={() => setOpen(false)}
              >
                <Link
                  href="/products"
                  className="block px-4 py-3 text-sm text-[#111827] hover:bg-[#F9FAFB]"
                  onClick={() => setOpen(false)}
                >
                  All Products
                </Link>
                <div className="h-px bg-[#EEF0F6]" />
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="block px-4 py-3 text-sm text-[#111827] hover:bg-[#F9FAFB]"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 font-semibold text-[#111827] hover:bg-[#F9FAFB]"
          >
            Cart
            {hydrated && totalQty > 0 ? (
              <span className="rounded-xl bg-[#F2F3FF] px-2 py-0.5 text-xs font-bold text-[#4338CA]">
                {totalQty}
              </span>
            ) : null}
          </Link>

          {canAdmin ? (
            <Link
              href="/admin"
              className="hidden rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 font-semibold text-[#111827] hover:bg-[#F9FAFB] sm:inline-flex"
            >
              Admin
            </Link>
          ) : null}

          {authHydrated && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-2xl bg-[#EEF2FF] font-semibold text-[#4338CA]">
                  {firstLetter}
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-[#111827]">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">Signed in</p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-2xl border border-[#EEF0F6] bg-white px-3 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
