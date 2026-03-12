"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "@/components/toast/Toaster";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") || "").trim();
      if (!email) {
        setError("Enter your email.");
        setLoading(false);
        return;
      }
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabaseBrowser().auth.resetPasswordForEmail(
        email,
        { redirectTo: origin ? `${origin}/reset-password` : undefined }
      );
      if (resetError) throw resetError;
      toast("success", "Password reset email sent");
      setLoading(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to send reset email.";
      setError(message);
      setLoading(false);
    }
  }

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

        <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-400">
          We&apos;ll email you a link to set a new password.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="you@university.edu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}

        <p className="mt-4 text-center text-xs text-slate-400">
          <Link href="/login" className="text-amber-300 hover:text-amber-200">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

