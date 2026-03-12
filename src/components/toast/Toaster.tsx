"use client";

import { useEffect, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";
type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

declare global {
  interface WindowEventMap {
    "app:toast": CustomEvent<{ type: ToastType; message: string }>;
  }
}

export function toast(type: ToastType, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app:toast", { detail: { type, message } }));
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const colors = useMemo(
    () => ({
      success: "border-emerald-400/30 text-emerald-200",
      error: "border-amber-400/30 text-amber-200",
      info: "border-blue-400/30 text-blue-200",
    }),
    []
  );

  useEffect(() => {
    function onToast(e: WindowEventMap["app:toast"]) {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = { id, type: e.detail.type, message: e.detail.message };
      setToasts((prev) => [item, ...prev].slice(0, 3));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }

    window.addEventListener("app:toast", onToast as EventListener);
    return () => window.removeEventListener("app:toast", onToast as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-2xl border bg-slate-950/80 px-4 py-3 text-sm shadow-xl shadow-black/60 backdrop-blur-xl ${colors[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

