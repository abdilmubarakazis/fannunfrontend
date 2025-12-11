import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  name: string;
  email: string;
  role: "user" | "admin";
};

type AuthState = {
  user: User | null;
  hydrated: boolean;
  setHydrated: () => void;

  loginDummy: (email: string, password: string) => Promise<void>;
  registerDummy: (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "ecommerce-auth-v1";

// ✅ rule admin yang lebih aman
function getRoleFromEmail(email: string): User["role"] {
  const e = email.trim().toLowerCase();

  // opsi 1 (recommended): hanya admin@...
  if (e.startsWith("admin@")) return "admin";

  // opsi 2 (kalau mau spesifik 1 akun):
  // if (e === "admin@test.com") return "admin";

  return "user";
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      loginDummy: async (email, password) => {
        const e = email.trim().toLowerCase();

        if (!e.includes("@")) throw new Error("Email tidak valid");
        if (password.length < 4) throw new Error("Password minimal 4 karakter");

        const role = getRoleFromEmail(e);

        set({
          user: {
            name: role === "admin" ? "Admin" : "User",
            email: e,
            role,
          },
        });
      },

      registerDummy: async ({ name, email, password, phone, address }) => {
        const n = name.trim();
        const e = email.trim().toLowerCase();

        if (n.length < 2) throw new Error("Nama minimal 2 karakter");
        if (!e.includes("@")) throw new Error("Email tidak valid");
        if (password.length < 4) throw new Error("Password minimal 4 karakter");
        if (phone.trim().length < 6) throw new Error("No HP tidak valid");
        if (address.trim().length < 10)
          throw new Error("Alamat minimal 10 karakter");

        set({
          user: { name: n, email: e, role: "user" },
        });
      },

      logout: () => {
        // reset state
        set({ user: null });

        // bersihin persist biar gak nyangkut role lama
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    }
  )
);
