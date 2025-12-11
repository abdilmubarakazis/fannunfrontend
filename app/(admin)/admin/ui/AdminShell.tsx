"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth.store";

function SidebarItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "group flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-[#F2F3FF] text-[#111827]"
          : "text-[#6B7280] hover:bg-[#F7F8FF]",
      ].join(" ")}
    >
      <span className="truncate">{label}</span>
      <span className="text-[#9CA3AF]" aria-hidden>
        →
      </span>
    </Link>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  // ✅ jangan panggil router.replace di render body -> lakukan di useEffect
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/products");
  }, [hydrated, user, router]);

  if (!hydrated)
    return <div className="p-6 text-sm text-[#6B7280]">Loading...</div>;
  if (!user)
    return <div className="p-6 text-sm text-[#6B7280]">Redirecting...</div>;
  if (user.role !== "admin")
    return <div className="p-6 text-sm text-[#6B7280]">Redirecting...</div>;

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-4 lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col rounded-3xl border border-[#EEF0F6] bg-white p-4">
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white font-bold">
              EC
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#111827]">
                E-Commerce
              </p>
              <p className="text-xs text-[#6B7280]">Admin Panel</p>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            {nav.map((it) => (
              <SidebarItem key={it.href} href={it.href} label={it.label} />
            ))}
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* user + logout (pojok kiri bawah) */}
          <div className="mt-6 border-t border-[#EEF0F6] pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EEF2FF] text-[#4338CA] font-semibold">
                {user.name?.slice(0, 1)?.toUpperCase() ?? "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[#6B7280]">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className={[
                "mt-3 w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3",
                "text-sm font-semibold text-[#111827] hover:bg-[#F9FAFB]",
              ].join(" ")}
            >
              Logout
            </button>

            {/* hint active page */}
            <p className="mt-3 px-2 text-[11px] text-[#9CA3AF]">
              Current:{" "}
              <span className="font-semibold text-[#6B7280]">{pathname}</span>
            </p>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
