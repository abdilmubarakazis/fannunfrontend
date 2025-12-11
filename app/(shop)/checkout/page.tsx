"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart.store";
import { formatIDR } from "@/lib/format";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const isEmpty = items.length === 0;

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.qty * it.price, 0),
    [items]
  );

  const canSubmit = useMemo(() => {
    if (isEmpty) return false;
    return (
      form.name.trim().length >= 2 &&
      form.phone.trim().length >= 6 &&
      form.address.trim().length >= 10
    );
  }, [form, isEmpty]);

  const submitDummy = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Dummy checkout: nanti kita sambungkan ke backend + Midtrans 😊");
    clear();
  };

  if (isEmpty) {
    return (
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#111827]">Checkout</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Keranjang kosong. Tambah produk dulu ya.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-flex rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-black/90"
        >
          Ke Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
        <h1 className="text-2xl font-semibold text-[#111827]">Checkout</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Isi data pengiriman (dummy dulu).
        </p>

        <form onSubmit={submitDummy} className="mt-4 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#111827]">Nama</label>
            <input
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama penerima"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#111827]">
              No. HP
            </label>
            <input
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              inputMode="tel"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#111827]">
              Alamat
            </label>
            <textarea
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat lengkap pengiriman"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#111827]">
              Catatan (opsional)
            </label>
            <textarea
              className="w-full rounded-2xl border border-[#EEF0F6] bg-white px-4 py-3 text-sm outline-none focus:border-black"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Contoh: warna hitam, kirim sore, dll"
              rows={3}
            />
          </div>

          <button
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-black/90"
          >
            Bayar (Dummy)
          </button>

          <p className="text-xs text-[#6B7280]">
            Nanti tombol ini akan call backend untuk generate{" "}
            <b>snap_token Midtrans</b>.
          </p>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#111827]">
            Ringkasan Pesanan
          </h2>

          <div className="mt-3 space-y-3">
            {items.map((it) => (
              <div
                key={it.key}
                className="flex items-start justify-between gap-3 rounded-2xl border border-[#EEF0F6] bg-[#F9FAFB] px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">
                    {it.name}
                  </p>

                  {it.variant?.color || it.variant?.size ? (
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      {it.variant?.color ? `Warna: ${it.variant.color}` : ""}
                      {it.variant?.color && it.variant?.size ? " • " : ""}
                      {it.variant?.size ? `Ukuran: ${it.variant.size}` : ""}
                    </p>
                  ) : null}

                  <p className="mt-1 text-sm text-[#6B7280]">
                    {it.qty} × {formatIDR(it.price)}
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#111827]">
                  {formatIDR(it.qty * it.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F7F8FF] px-4 py-3">
            <p className="text-sm text-[#6B7280]">Total</p>
            <p className="text-xl font-semibold text-[#111827]">
              {formatIDR(total)}
            </p>
          </div>

          <div className="mt-4">
            <Link
              href="/cart"
              className="text-sm font-semibold text-[#4F46E5] hover:underline"
            >
              ← Kembali ke cart
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#EEF0F6] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            Setelah backend siap, alurnya:
            <br />
            1) POST /api/checkout
            <br />
            2) dapat snap_token
            <br />
            3) panggil Midtrans Snap di frontend
          </p>
        </div>
      </div>
    </div>
  );
}
