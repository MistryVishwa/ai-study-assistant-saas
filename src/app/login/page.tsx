import Link from "next/link";

export default function LoginPage() {
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

        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to access your dashboard, notes, and quizzes.
        </p>

        <form className="mt-6 space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="text-slate-200">
              Email
            </label>
            <input
              id="email"
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
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/70"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-700" />
              <span>Keep me signed in</span>
            </label>
            <Link href="/forgot-password" className="text-amber-300 hover:text-amber-200">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-blue-500/40"
          >
            Continue
          </button>
        </form>

        <div className="mt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900">
            <span className="h-4 w-4 rounded-full bg-slate-300" />
            Continue with Google
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          New to EduPilot?{" "}
          <Link href="/register" className="text-amber-300 hover:text-amber-200">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

