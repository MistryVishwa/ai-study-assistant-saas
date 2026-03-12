import Link from "next/link";

const modules = [
  {
    id: "analytics",
    name: "Study Analytics",
    href: "/dashboard",
    description: "Visualize study hours, quiz scores, and streaks in real time.",
  },
  {
    id: "tasks",
    name: "Today's AI Tasks",
    href: "/dashboard",
    description: "Let EduPilot plan your day with smart task suggestions.",
  },
  {
    id: "tutor",
    name: "AI Tutor Search",
    href: "/tutor",
    description: "Ask questions and get step-by-step explanations instantly.",
  },
  {
    id: "lectures",
    name: "Lecture Library",
    href: "/lectures",
    description: "Upload, organize, and summarize lecture videos and notes.",
  },
  {
    id: "notes",
    name: "AI Notes Generator",
    href: "/notes",
    description: "Turn PDFs, slides, and text into concise revision notes.",
  },
  {
    id: "planner",
    name: "Study Planner",
    href: "/planner",
    description: "Generate exam prep plans and smart study schedules.",
  },
  {
    id: "flashcards",
    name: "Flashcards & SRS",
    href: "/flashcards",
    description: "Create AI flashcards and practice with spaced repetition.",
  },
  {
    id: "quizzes",
    name: "Quiz System",
    href: "/quizzes",
    description: "Generate MCQ, T/F, and short-answer quizzes with scoring.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.18),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 md:px-8">
        {/* Top nav */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-amber-400 shadow-lg shadow-blue-500/40">
              <span className="text-sm font-bold tracking-tight">EP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                EduPilot
              </h1>
              <p className="text-xs text-slate-400">
                AI Study Assistant Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <Link
              href="/login"
              className="rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-slate-200 shadow-sm shadow-black/40 backdrop-blur-md transition hover:border-blue-400/70 hover:text-blue-100"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard?demo=1"
              className="hidden rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-blue-500/40 backdrop-blur md:inline-flex"
            >
              Start demo
            </Link>
          </div>
        </header>

        {/* Hero + quick stats */}
        <main className="flex flex-1 flex-col gap-6 md:flex-row">
          <section className="flex-1">
            <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)]" />
              <div className="relative space-y-4">
                <p className="inline-flex rounded-full border border-blue-400/40 bg-slate-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-blue-200/90 shadow-sm shadow-blue-500/40">
                  Smart AI workspace for learners
                </p>
                <h2 className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl lg:text-4xl">
                  Focus on learning.{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                    EduPilot
                  </span>{" "}
                  handles the rest.
                </h2>
                <p className="max-w-xl text-sm text-slate-300/90 md:text-base">
                  Centralize lectures, notes, quizzes, and AI tutoring in one
                  glassmorphism dashboard. Designed for students, self-learners,
                  and busy professionals.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-xs md:text-sm">
                  <Link
                    href="/dashboard?demo=1"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-medium text-slate-950 shadow-lg shadow-blue-500/40"
                  >
                    Start demo
                  </Link>
                  <Link
                    href="/dashboard?demo=1"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/50 px-4 py-2 text-slate-200/90"
                  >
                    View study planner
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-300/90 md:text-sm">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Weekly hours
                    </p>
                    <p className="mt-1 text-lg font-semibold text-amber-300">
                      18.4
                    </p>
                    <p className="text-[11px] text-emerald-300/80">
                      +12% vs last week
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Learning streak
                    </p>
                    <p className="mt-1 text-lg font-semibold text-blue-300">
                      9 days
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Don&apos;t break the chain
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Quizzes this week
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">
                      6
                    </p>
                    <p className="text-[11px] text-emerald-300/80">
                      Avg. score 82%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right column: modules & quick actions */}
          <aside className="mt-4 flex w-full flex-col gap-4 md:mt-0 md:w-[19rem]">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-xl shadow-black/60 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-slate-100">
                Quick actions
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Jump into the most common study flows.
              </p>
              <div className="mt-3 space-y-2 text-xs">
                <Link
                  href="/tutor"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 transition hover:border-blue-400/80 hover:bg-slate-900"
                >
                  <span>Ask the AI Tutor</span>
                  <span className="text-[11px] text-blue-300">Chat</span>
                </Link>
                <Link
                  href="/notes"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 transition hover:border-amber-300/80 hover:bg-slate-900"
                >
                  <span>Generate notes from PDF</span>
                  <span className="text-[11px] text-amber-300">Notes</span>
                </Link>
                <Link
                  href="/planner"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 transition hover:border-emerald-300/80 hover:bg-slate-900"
                >
                  <span>Plan my exam week</span>
                  <span className="text-[11px] text-emerald-300">Planner</span>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-xl shadow-black/60 backdrop-blur-xl">
              <h3 className="mb-2 text-sm font-semibold text-slate-100">
                EduPilot modules
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((m) => (
                  <Link
                    key={m.id}
                    href={m.href}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-800/70 bg-slate-900/60 p-3 text-xs text-slate-200 transition hover:border-blue-400/70 hover:bg-slate-900"
                  >
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="mt-1 line-clamp-3 text-[11px] text-slate-400">
                        {m.description}
                      </p>
                    </div>
                    <span className="mt-2 text-[10px] text-blue-300 group-hover:text-amber-300">
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-6 flex items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} EduPilot. Built for focused learning.</p>
          <div className="flex gap-3">
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-300">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
