"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth.store";
import { toast } from "@/components/Toaster";

export default function RegisterPage() {
  const router = useRouter();
  const registerDummy = useAuth((s) => s.registerDummy);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerDummy(form);
      toast("✅ Register berhasil (dummy)");
      router.push("/products");
    } catch (err: any) {
      toast(`❌ ${err?.message ?? "Register gagal"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="text-sm text-gray-600">
          Isi data sesuai field Laravel kamu.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nama</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama lengkap"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
            inputMode="email"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimal 4 karakter"
            type="password"
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">No. HP</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            inputMode="tel"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Alamat</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Alamat lengkap"
            rows={3}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Create account"}
        </button>

        <p className="text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link className="font-medium hover:underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
