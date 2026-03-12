"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { toast } from "@/components/toast/Toaster";

function getHashParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return Object.fromEntries(new URLSearchParams(hash));
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrapRecoverySession() {
      try {
        const supabase = supabaseBrowser();
        const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
        const code = url?.searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          setReady(true);
          return;
        }

        const hashParams = getHashParams();
        const access_token = hashParams["access_token"];
        const refresh_token = hashParams["refresh_token"];
        if (access_token && refresh_token) {
          const { error: setErrorSession } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErrorSession) throw setErrorSession;
          setReady(true);
          return;
        }

        setReady(true);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Unable to initialize password reset.";
        setError(message);
        setReady(true);
      }
    }

    bootstrapRecoverySession();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const password = String(formData.get("password") || "");
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabaseBrowser().auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      toast("success", "Password updated");
      setLoading(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to reset password.";
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

        <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-400">
          Choose a strong password to secure your account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm">
            <label htmlFor="password" className="text-slate-200">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="Create a strong password"
              disabled={!ready}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !ready}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
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

