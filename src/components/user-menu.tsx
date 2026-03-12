"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleSignOut() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
      >
        Sign out
      </button>
      <Link
        href="/profile"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-xs font-semibold text-slate-900 shadow-md shadow-black/40 md:h-9 md:w-9"
      >
        A
      </Link>
    </div>
  );
}
