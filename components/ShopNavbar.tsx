"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth.store";
import { useCart } from "@/lib/cart.store"; // kalau kamu punya
import { useMemo } from "react";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={[
        "rounded-2xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-[#F2F3FF] text-[#111827]"
          : "text-[#6B7280] hover:bg-[#F7F8FF]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function ShopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  // kalau cart store kamu beda, sesuaikan
  const cartCount =
    useCart?.((s: any) =>
      s.items?.reduce((a: number, it: any) => a + (it.qty ?? 1), 0)
    ) ?? 0;

  const showAdminLink = useMemo(() => !!user && user.role === "admin", [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#EEF0F6] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white font-bold"
            aria-label="Home"
          >
            EC
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            <NavItem href="/" label="Home" />
            <NavItem href="/products" label="Products" />
            {showAdminLink ? <NavItem href="/admin" label="Admin" /> : null}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* “chart/icon” area — jangan hilangkan, pastikan visible */}
          <Link
            href="/cart"
            className="relative grid h-11 w-11 place-items-center rounded-2xl border border-[#EEF0F6] bg-white hover:bg-[#F9FAFB]"
            aria-label="Cart"
          >
            🛒
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-[#4F46E5] px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {!hydrated ? (
            <div className="text-xs text-[#6B7280]">...</div>
          ) : user ? (
            <>
              <div className="hidden sm:block rounded-2xl border border-[#EEF0F6] bg-[#F7F8FF] px-3 py-2">
                <p className="text-xs font-semibold text-[#111827]">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#6B7280]">{user.role}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  // kalau lagi di /admin, pastikan balik ke login
                  if (pathname?.startsWith("/admin")) router.replace("/login");
                  else router.replace("/");
                }}
                className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="mx-auto block max-w-7xl px-4 pb-3 sm:hidden lg:px-6">
        <div className="flex gap-2">
          <NavItem href="/" label="Home" />
          <NavItem href="/products" label="Products" />
          {showAdminLink ? <NavItem href="/admin" label="Admin" /> : null}
        </div>
      </div>
    </header>
  );
}
