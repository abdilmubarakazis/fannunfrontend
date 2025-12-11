"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth.store";
import { formatIDR } from "@/lib/format";
import { loadJSON } from "@/lib/localStore";
import { products, categories } from "@/lib/dummy";

type OrderStatus = "pending" | "paid" | "shipped" | "done" | "canceled";
type Order = {
  id: string;
  createdAt: string; // ISO
  status: OrderStatus;
  items: { productId: number; qty: number; price: number }[];
};

function calcTotal(order: Order) {
  return order.items.reduce((sum, it) => sum + it.qty * it.price, 0);
}
function inSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
function lastNDaysRevenueSeries(orders: Order[], days = 14) {
  const now = new Date();
  const keys: string[] = [];
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    keys.push(dateKey(d));
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
  }

  const paid = orders.filter(
    (o) => o.status === "paid" || o.status === "shipped" || o.status === "done"
  );

  const map = new Map<string, number>();
  for (const o of paid) {
    const k = dateKey(new Date(o.createdAt));
    map.set(k, (map.get(k) ?? 0) + calcTotal(o));
  }

  return keys.map((k, idx) => ({
    label: labels[idx],
    value: map.get(k) ?? 0,
  }));
}

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 520;
  const h = 170;
  const pad = 18;

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);

  const x = (i: number) =>
    pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) =>
    pad + (h - pad * 2) - ((v - min) * (h - pad * 2)) / Math.max(1, max - min);

  const dPath = data
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p.value).toFixed(2)}`
    )
    .join(" ");

  const areaPath = `${dPath} L ${x(data.length - 1).toFixed(2)} ${(
    h - pad
  ).toFixed(2)} L ${x(0).toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <div className="rounded-2xl border border-[#EEF0F6] bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Today’s trends</p>
          <p className="text-xs text-[#6B7280]">Revenue (14 hari)</p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl bg-[#F7F8FF]">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[190px] w-full">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: 5 }).map((_, i) => {
            const yy = pad + (i * (h - pad * 2)) / 4;
            return (
              <line
                key={i}
                x1={pad}
                x2={w - pad}
                y1={yy}
                y2={yy}
                stroke="#E9EAF2"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill="url(#grad)" />
          <path
            d={dPath}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {data.length > 0 ? (
            <>
              <circle
                cx={x(data.length - 1)}
                cy={y(data[data.length - 1].value)}
                r="6"
                fill="#7C3AED"
              />
              <circle
                cx={x(data.length - 1)}
                cy={y(data[data.length - 1].value)}
                r="10"
                fill="#7C3AED"
                opacity="0.15"
              />
            </>
          ) : null}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6B7280]">
        {data.slice(-5).map((d) => (
          <span
            key={d.label}
            className="rounded-full border border-[#EEF0F6] bg-white px-2 py-1"
          >
            {d.label}: <b className="text-[#111827]">{formatIDR(d.value)}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function TopProducts({
  productsAll,
  orders,
}: {
  productsAll: any[];
  orders: Order[];
}) {
  const rows = useMemo(() => {
    const paid = orders.filter(
      (o) =>
        o.status === "paid" || o.status === "shipped" || o.status === "done"
    );

    const map = new Map<number, { qty: number; revenue: number }>();
    for (const o of paid) {
      for (const it of o.items) {
        const cur = map.get(it.productId) ?? { qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.price;
        map.set(it.productId, cur);
      }
    }

    return Array.from(map.entries())
      .map(([productId, v]) => {
        const p = productsAll.find((x) => x.id === productId);
        return {
          productId,
          name: p?.name ?? `Product #${productId}`,
          qty: v.qty,
          revenue: v.revenue,
          isActive: p?.isActive ?? true,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, productsAll]);

  const maxRevenue = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <div className="rounded-2xl border border-[#EEF0F6] bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Top Products</p>
          <p className="text-xs text-[#6B7280]">
            Best seller (paid/shipped/done)
          </p>
        </div>

        <Link
          href="/admin/products"
          className="text-xs font-semibold text-[#4F46E5] hover:underline"
        >
          Manage products
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
          Belum ada penjualan. Ubah status order ke <b>paid/shipped/done</b>{" "}
          untuk muncul di sini.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((r, idx) => (
            <div
              key={r.productId}
              className="rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">
                    #{idx + 1} {r.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Terjual: <b className="text-[#111827]">{r.qty}</b> •
                    Revenue:{" "}
                    <b className="text-[#111827]">{formatIDR(r.revenue)}</b>
                  </p>
                </div>

                <span
                  className={[
                    "rounded-xl px-2 py-1 text-[10px] font-semibold",
                    r.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700",
                  ].join(" ")}
                >
                  {r.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#7C3AED]"
                  style={{
                    width: `${Math.round((r.revenue / maxRevenue) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/products");
  }, [hydrated, user, router]);

  const adminProducts = useMemo(
    () => loadJSON("admin-products-v1", products),
    []
  );
  const adminCategories = useMemo(
    () => loadJSON("admin-categories-v1", categories),
    []
  );
  const adminOrders = useMemo(
    () => loadJSON<Order[]>("admin-orders-v1", []),
    []
  );

  const now = new Date();
  const monthName = now.toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const paidOrders = useMemo(
    () =>
      adminOrders.filter(
        (o) =>
          o.status === "paid" || o.status === "shipped" || o.status === "done"
      ),
    [adminOrders]
  );

  const stats = useMemo(() => {
    const revenueAll = paidOrders.reduce((sum, o) => sum + calcTotal(o), 0);
    const revenueThisMonth = paidOrders
      .filter((o) => inSameMonth(new Date(o.createdAt), now))
      .reduce((sum, o) => sum + calcTotal(o), 0);

    const pending = adminOrders.filter((o) => o.status === "pending").length;
    const doneCount = adminOrders.filter((o) => o.status === "done").length;

    return {
      revenueAll,
      revenueThisMonth,
      pending,
      newOrders: adminOrders.length,
      totalProducts: adminProducts.length,
      totalCategories: adminCategories.length,
      doneCount,
    };
  }, [
    adminOrders,
    adminProducts.length,
    adminCategories.length,
    paidOrders,
    now,
  ]);

  const series = useMemo(
    () => lastNDaysRevenueSeries(adminOrders, 14),
    [adminOrders]
  );
  const [search, setSearch] = useState("");

  if (!hydrated)
    return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  if (!user || user.role !== "admin")
    return <div className="p-6 text-sm text-gray-600">Redirecting...</div>;

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#6B7280]">Total Revenues</p>
          <div className="mt-1 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-semibold text-[#111827]">
              {formatIDR(stats.revenueAll)}
            </p>
            <span className="text-xs text-emerald-600 font-semibold">
              ▲ +12.5%
            </span>
            <span className="text-xs text-rose-500 font-semibold">▼ -2.0%</span>
          </div>
          <p className="mt-1 text-xs text-[#6B7280]">Month: {monthName}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[320px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
              ⌘K
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="grid h-11 w-11 place-items-center rounded-2xl border border-[#EEF0F6] bg-white hover:bg-gray-50"
              type="button"
              aria-label="Notifications"
            >
              🔔
            </button>
            <button
              className="grid h-11 w-11 place-items-center rounded-2xl border border-[#EEF0F6] bg-white hover:bg-gray-50"
              type="button"
              aria-label="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] p-5 text-white shadow-sm">
          <p className="text-xs text-white/80">Revenue</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-2xl font-semibold">
              {formatIDR(stats.revenueAll)}
            </p>
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-xs font-semibold">
              All time
            </div>
          </div>
          <p className="mt-3 text-xs text-white/80">
            This month: {formatIDR(stats.revenueThisMonth)}
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#EC4899] to-[#F97316] p-5 text-white shadow-sm">
          <p className="text-xs text-white/80">Pending orders</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-semibold">
              {String(stats.pending).padStart(2, "0")}
            </p>
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-xs font-semibold">
              Need review
            </div>
          </div>
          <p className="mt-3 text-xs text-white/80">
            Check payment confirmation
          </p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] p-5 text-white shadow-sm">
          <p className="text-xs text-white/80">New orders</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-semibold">
              {String(stats.newOrders).padStart(2, "0")}
            </p>
            <Link
              href="/admin/orders"
              className="rounded-2xl bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/20"
            >
              View all →
            </Link>
          </div>
          <p className="mt-3 text-xs text-white/80">
            Orders stored in localStorage
          </p>
        </div>
      </div>

      {/* Panels */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-[#EEF0F6] bg-white p-4">
            <p className="text-sm font-semibold text-[#111827]">Quick stats</p>
            <p className="mt-1 text-xs text-[#6B7280]">Ringkasan cepat.</p>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] p-3">
                <p className="text-xs text-[#6B7280]">Products</p>
                <p className="mt-1 text-xl font-semibold text-[#111827]">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] p-3">
                <p className="text-xs text-[#6B7280]">Categories</p>
                <p className="mt-1 text-xl font-semibold text-[#111827]">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] p-3">
                <p className="text-xs text-[#6B7280]">Done orders</p>
                <p className="mt-1 text-xl font-semibold text-[#111827]">
                  {stats.doneCount}
                </p>
              </div>
            </div>
          </div>

          <TopProducts productsAll={adminProducts} orders={adminOrders} />
        </div>

        <div className="lg:col-span-2">
          <TrendChart data={series} />
        </div>
      </div>

      <div className="text-xs text-[#6B7280]">
        * Dashboard ini pakai data localStorage (admin-orders-v1 /
        admin-products-v1 / admin-categories-v1).
      </div>
    </div>
  );
}
