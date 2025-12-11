"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth.store";
import { toast } from "@/components/Toaster";

export default function LoginPage() {
  const router = useRouter();
  const loginDummy = useAuth((s) => s.loginDummy);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginDummy(email, password);
      toast("✅ Login berhasil (dummy)");

      const u = useAuth.getState().user; // ambil user terbaru dari store
      if (u?.role === "admin") router.replace("/admin");
      else router.replace("/products");
    } catch (err: any) {
      toast(`❌ ${err?.message ?? "Login gagal"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-gray-600">
          UI dulu (dummy). Nanti connect ke backend.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            inputMode="email"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link className="font-medium hover:underline" href="/register">
            Register
          </Link>
        </p>

        <p className="text-xs text-gray-500">
          Tips dummy: gunakan email <b>admin@...</b> untuk role admin.
        </p>
      </form>
    </div>
  );
}
