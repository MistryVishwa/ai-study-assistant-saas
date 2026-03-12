"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function getSafeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNext(searchParams.get("next"));
  const { login, oauthLogin, phoneLoginSend, phoneLoginVerify, magicLink } =
    useAuth();

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingPhoneSend, setLoadingPhoneSend] = useState(false);
  const [loadingPhoneVerify, setLoadingPhoneVerify] = useState(false);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneForOtp, setPhoneForOtp] = useState("");

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoadingEmail(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");

      await login({ email, password });

      router.push(nextPath);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to sign in.";
      setError(message);
      setLoadingEmail(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoadingGoogle(true);
    try {
      await oauthLogin("google", nextPath);
      setLoadingGoogle(false);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to start Google sign-in.";
      setLoadingGoogle(false);
      setError(message);
    }
  }

  async function handlePhoneSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const phone = String(formData.get("phone") || "").trim();
      if (!phone) {
        setError("Enter a phone number (E.164, e.g. +15551234567).");
        return;
      }
      setLoadingPhoneSend(true);
      await phoneLoginSend(phone);
      setLoadingPhoneSend(false);
      setPhoneForOtp(phone);
      setOtpSent(true);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to send SMS code.";
      setLoadingPhoneSend(false);
      setError(message);
    }
  }

  async function handlePhoneVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const token = String(formData.get("token") || "").trim();
      if (!token || !phoneForOtp) {
        setError("Enter the code sent to your phone.");
        return;
      }
      setLoadingPhoneVerify(true);
      await phoneLoginVerify(phoneForOtp, token);
      setLoadingPhoneVerify(false);
      router.push(nextPath);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to verify code.";
      setLoadingPhoneVerify(false);
      setError(message);
    }
  }

  async function handleMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const email =
        (typeof document !== "undefined" &&
          (document.querySelector('input[name="email"]') as HTMLInputElement | null)
            ?.value) ||
        "";
      if (!email) {
        setError("Enter your email to receive a magic link.");
        return;
      }
      setLoadingMagic(true);
      await magicLink(email, nextPath);
      setLoadingMagic(false);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to send magic link.";
      setLoadingMagic(false);
      setError(message);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-2xl shadow-black/70 backdrop-blur-2xl md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-amber-400 shadow-lg shadow-blue-500/40">
          <span className="text-sm font-bold tracking-tight text-slate-950">
            E
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
            EduPilot
          </p>
          <p className="text-[11px] text-slate-400">AI Study Platform</p>
        </div>
      </div>

      <h1 className="text-xl font-semibold tracking-tight">Log in or sign up</h1>
      <p className="mt-1 text-sm text-slate-400">
        Sign in to access your dashboard, notes, and quizzes.
      </p>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="h-4 w-4 rounded-full bg-slate-300" />
          {loadingGoogle ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>

      {!otpSent ? (
        <form className="mt-4 space-y-4" onSubmit={handlePhoneSend}>
          <div className="space-y-1 text-sm">
            <label htmlFor="phone" className="text-slate-200">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="+15551234567"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPhoneSend}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPhoneSend ? "Sending code..." : "Continue with Phone"}
          </button>
        </form>
      ) : (
        <form className="mt-4 space-y-4" onSubmit={handlePhoneVerify}>
          <p className="text-xs text-slate-400">
            Code sent — enter the SMS code to sign in.
          </p>
          <div className="space-y-1 text-sm">
            <label htmlFor="token" className="text-slate-200">
              SMS code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="123456"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPhoneVerify}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPhoneVerify ? "Verifying..." : "Verify and sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setPhoneForOtp("");
              setError(null);
            }}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-300"
          >
            Use a different phone
          </button>
        </form>
      )}

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800/80" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          OR
        </span>
        <div className="h-px flex-1 bg-slate-800/80" />
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleEmailLogin}>
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

        <div className="space-y-1 text-sm">
          <label htmlFor="password" className="text-slate-200">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-700"
            />
            <span>Keep me signed in</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-amber-300 hover:text-amber-200"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loadingEmail}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingEmail ? "Signing in..." : "Continue with Email"}
        </button>
      </form>

      <form className="mt-3" onSubmit={handleMagicLink}>
        <button
          type="submit"
          disabled={loadingMagic}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingMagic ? "Sending link..." : "Continue with Magic Link"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}

      <p className="mt-4 text-center text-xs text-slate-400">
        New to EduPilot?{" "}
        <Link
          href={
            nextPath !== "/dashboard"
              ? `/register?next=${encodeURIComponent(nextPath)}`
              : "/register"
          }
          className="text-amber-300 hover:text-amber-200"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/90 p-8 text-center text-sm text-slate-400">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
