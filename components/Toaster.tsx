"use client";

import { useEffect, useState } from "react";

type Toast = { id: string; message: string };

declare global {
  interface Window {
    __toast?: (message: string) => void;
  }
}

export function toast(message: string) {
  if (typeof window !== "undefined" && window.__toast) window.__toast(message);
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    window.__toast = (message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 1800);
    };

    return () => {
      window.__toast = undefined;
    };
  }, []);

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-xl border bg-white px-4 py-3 text-sm shadow-md"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
