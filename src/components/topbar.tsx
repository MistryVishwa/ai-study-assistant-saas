import Link from "next/link";
import { UserMenu } from "@/components/user-menu";

export function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-800/70 bg-slate-950/70 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur-2xl md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="hidden text-xs text-slate-400 md:block">
          <p className="uppercase tracking-[0.22em] text-amber-300">
            Dashboard
          </p>
          <p className="text-[11px] text-slate-500">
            Wednesday, 11 March 2026 · 13:35
          </p>
        </div>
        <div className="relative flex-1 max-w-xl">
          <input
            type="search"
            placeholder="Search anything… lectures, topics, quizzes"
            className="w-full rounded-full border border-slate-800/70 bg-slate-900/80 px-4 py-2 text-sm text-slate-100 shadow-inner shadow-black/60 outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
          />
        </div>
      </div>

      <div className="flex flex-none items-center gap-2 text-xs md:gap-3 md:text-sm">
        <span className="hidden rounded-full border border-amber-500/60 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-200 md:inline-flex">
          14d
        </span>
        <Link
          href="/notes"
          className="hidden rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-2 font-medium text-amber-100 shadow-lg shadow-amber-500/30 transition hover:border-amber-400/80 hover:bg-slate-900 md:inline-flex"
        >
          Generate Notes
        </Link>
        <Link
          href="/tutor"
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-blue-500/40"
        >
          Ask AI Tutor
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}

