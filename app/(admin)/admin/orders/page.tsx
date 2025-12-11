"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth.store";
import { formatIDR } from "@/lib/format";
import { loadJSON, saveJSON } from "@/lib/localStore";
import { products } from "@/lib/dummy";
import { toast } from "@/components/Toaster";

type OrderStatus = "pending" | "paid" | "shipped" | "done" | "canceled";
type OrderItem = { productId: number; qty: number; price: number };
type Order = {
  id: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string };
  shipping: { address: string; notes?: string };
  status: OrderStatus;
  items: OrderItem[];
};

const KEY = "admin-orders-v1";

function calcTotal(order: Order) {
  return order.items.reduce((sum, it) => sum + it.qty * it.price, 0);
}

function statusPill(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "paid":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-violet-100 text-violet-700";
    case "done":
      return "bg-emerald-100 text-emerald-700";
    case "canceled":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function seedOrders(): Order[] {
  const p1 = products[0];
  const p2 = products[1] ?? products[0];

  return [
    {
      id: "ORD-1001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      customer: { name: "Budi", email: "budi@mail.com", phone: "08123456789" },
      shipping: { address: "Jl. Mawar No. 12, Bandung", notes: "Bubble wrap" },
      status: "pending",
      items: [
        { productId: p1.id, qty: 1, price: p1.price },
        { productId: p2.id, qty: 2, price: p2.price },
      ],
    },
    {
      id: "ORD-1002",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      customer: { name: "Sari", email: "sari@mail.com", phone: "082233445566" },
      shipping: { address: "Komplek Melati Blok C2, Jakarta" },
      status: "paid",
      items: [{ productId: p2.id, qty: 1, price: p2.price }],
    },
  ];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);

  // auth guard
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/products");
  }, [hydrated, user, router]);

  // data
  const [orders, setOrders] = useState<Order[]>(() =>
    loadJSON<Order[]>(KEY, seedOrders())
  );
  useEffect(() => saveJSON(KEY, orders), [orders]);

  // ui state
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders
      .filter((o) => (status === "all" ? true : o.status === status))
      .filter((o) => {
        if (!query) return true;
        const hay =
          `${o.id} ${o.customer.name} ${o.customer.email}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, q, status]);

  const [selectedId, setSelectedId] = useState<string | null>(
    orders[0]?.id ?? null
  );
  useEffect(() => {
    if (!selectedId && filtered[0]) setSelectedId(filtered[0].id);
    if (selectedId && !filtered.some((x) => x.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((o) => o.id === selectedId) ?? null;

  const updateStatus = (id: string, next: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o))
    );
    toast(`✅ Status ${id} → ${next}`);
  };

  const removeOrder = (id: string) => {
    if (!confirm(`Hapus order ${id}?`)) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast("🗑️ Order dihapus (dummy)");
  };

  if (!hydrated)
    return <div className="p-6 text-sm text-[#6B7280]">Loading...</div>;
  if (!user || user.role !== "admin")
    return <div className="p-6 text-sm text-[#6B7280]">Redirecting...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#6B7280]">ADMIN</p>
            <h1 className="text-2xl font-semibold text-[#111827]">Orders</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              List order (dummy) + update status.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-3xl border border-[#EEF0F6] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#111827]">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="ORD-1001 / nama / email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#111827]">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="all">All</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="done">done</option>
            <option value="canceled">canceled</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-end">
          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
            className="w-full rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-4 py-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FF]"
          >
            Reset filter
          </button>
        </div>
      </div>

      {/* Master-detail */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* list */}
        <div className="overflow-hidden rounded-3xl border border-[#EEF0F6] bg-white">
          <div className="bg-[#F7F8FF] px-4 py-3 text-xs font-semibold text-[#6B7280]">
            Orders ({filtered.length})
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-[#6B7280]">No orders.</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedId(o.id)}
                className={[
                  "w-full border-t border-[#EEF0F6] px-4 py-3 text-left text-sm hover:bg-[#F9FAFB]",
                  selectedId === o.id ? "bg-[#F9FAFB]" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111827]">
                      {o.id}
                    </p>
                    <p className="truncate text-xs text-[#6B7280]">
                      {o.customer.name}
                    </p>
                  </div>
                  <span
                    className={`rounded-2xl px-2 py-1 text-[10px] font-semibold ${statusPill(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {new Date(o.createdAt).toLocaleString("id-ID")}
                </p>
              </button>
            ))
          )}
        </div>

        {/* detail */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="rounded-3xl border border-[#EEF0F6] bg-white p-6 text-sm text-[#6B7280]">
              Pilih order di sebelah kiri.
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280]">
                      ORDER
                    </p>
                    <h2 className="text-xl font-semibold text-[#111827]">
                      {selected.id}
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {new Date(selected.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        updateStatus(selected.id, e.target.value as OrderStatus)
                      }
                      className="rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    >
                      <option value="pending">pending</option>
                      <option value="paid">paid</option>
                      <option value="shipped">shipped</option>
                      <option value="done">done</option>
                      <option value="canceled">canceled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removeOrder(selected.id)}
                      className="rounded-2xl border border-[#EEF0F6] bg-[#FFF1F2] px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-[#FFE4E6]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
                  <p className="text-sm font-semibold text-[#111827]">
                    Customer
                  </p>
                  <p className="mt-2 text-sm text-[#111827]">
                    {selected.customer.name}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {selected.customer.email}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {selected.customer.phone}
                  </p>
                </div>

                <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
                  <p className="text-sm font-semibold text-[#111827]">
                    Shipping
                  </p>
                  <p className="mt-2 text-sm text-[#111827]">
                    {selected.shipping.address}
                  </p>
                  {selected.shipping.notes ? (
                    <p className="mt-2 text-sm text-[#6B7280]">
                      Notes: {selected.shipping.notes}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
                <p className="text-sm font-semibold text-[#111827]">Items</p>

                <div className="mt-3 space-y-2">
                  {selected.items.map((it, idx) => {
                    const p = products.find((x) => x.id === it.productId);
                    const name = p?.name ?? `Product #${it.productId}`;
                    const line = it.qty * it.price;

                    return (
                      <div
                        key={`${it.productId}-${idx}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#111827]">
                            {name}
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            {it.qty} × {formatIDR(it.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-[#111827]">
                          {formatIDR(line)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#EEF0F6] pt-3">
                  <p className="text-sm text-[#6B7280]">Total</p>
                  <p className="text-xl font-semibold text-[#111827]">
                    {formatIDR(calcTotal(selected))}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
