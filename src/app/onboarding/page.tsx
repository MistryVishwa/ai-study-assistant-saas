"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-2xl shadow-black/70 backdrop-blur-2xl md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-amber-400 shadow-lg shadow-blue-500/40">
            <span className="text-sm font-bold tracking-tight text-slate-950">E</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              EduPilot
            </p>
            <p className="text-[11px] text-slate-400">AI Study Platform</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold tracking-tight">Welcome to EduPilot</h1>
        <p className="mt-1 text-sm text-slate-400">
          {loading
            ? "Setting up your workspace…"
            : user
              ? "Your workspace is ready. Continue to your dashboard."
              : "Verify your email to continue, then sign in."}
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40"
          >
            Continue
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

