"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function getSafeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNext(searchParams.get("next"));
  const { signup, oauthLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get("name") || "");
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");
      const goal = String(formData.get("goal") || "");

      const result = await signup({
        fullName: name,
        email,
        password,
        learningGoal: goal || "student",
      });
      setLoading(false);
      if (result.status === "verify_email") {
        setSuccessMessage("Verify your email to continue");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to create account.";
      setError(message);
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setSuccessMessage(null);
    setLoadingGoogle(true);
    try {
      await oauthLogin("google", nextPath);
      setLoadingGoogle(false);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to start Google sign-up.";
      setLoadingGoogle(false);
      setError(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
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

        <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Set up your EduPilot workspace in under a minute.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="text-slate-200">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="Aryan Patel"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
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
              type="password"
              name="password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="Create a strong password"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="goal" className="text-slate-200">
              Primary learning goal
            </label>
            <select
              id="goal"
              name="goal"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              defaultValue="student"
            >
              <option value="student">University / school studies</option>
              <option value="self-learning">Self-learning & skills</option>
              <option value="intern">Internship & projects</option>
              <option value="professional">Professional upskilling</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-amber-300">{error}</p>
        )}
        {successMessage && (
          <p className="mt-3 text-sm text-emerald-300/90">{successMessage}</p>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loadingGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="h-4 w-4 rounded-full bg-slate-300" />
            {loadingGoogle ? "Redirecting..." : "Sign up with Google"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            href={
              nextPath !== "/dashboard"
                ? `/login?next=${encodeURIComponent(nextPath)}`
                : "/login"
            }
            className="text-amber-300 hover:text-amber-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
