import Link from "next/link";

export default function RegisterPage() {
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

        <form className="mt-6 space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="text-slate-200">
              Full name
            </label>
            <input
              id="name"
              type="text"
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
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-300 hover:text-amber-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

