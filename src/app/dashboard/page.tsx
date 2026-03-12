import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-lg shadow-black/60">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-amber-200">{value}</p>
      <p className="mt-1 text-xs text-emerald-300/90">{helper}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activePath="/dashboard" />

      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />

        <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.18),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
          {/* Welcome banner */}
          <section className="mb-4 overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40 p-5 shadow-2xl shadow-amber-500/25 backdrop-blur-2xl md:p-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200">
              Good morning
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
                Welcome back,{" "}
                <span className="text-amber-200">
                  Aryan<span className="pl-1">✨</span>
                </span>
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-300 md:text-[15px]">
              3 tasks pending · 1 quiz due ·{" "}
              <span className="text-amber-200">14-day streak</span> — keep it
              up!
            </p>
          </section>

          {/* Stats row */}
          <section className="grid gap-3 md:grid-cols-4">
            <StatCard
              label="Study Hours"
              value="47.5h"
              helper="+12% vs last week"
            />
            <StatCard
              label="Topics Done"
              value="28"
              helper="Finish 3 more to hit goal"
            />
            <StatCard
              label="Quiz Score"
              value="84%"
              helper="+6% improvement"
            />
            <StatCard
              label="XP Points"
              value="4,820"
              helper="+320 today"
            />
          </section>

          {/* Activity + tasks */}
          <section className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4 shadow-xl shadow-black/60">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-100">Study Activity</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <button className="rounded-full bg-slate-900/80 px-2 py-1 text-amber-200">
                      This week
                    </button>
                    <button className="rounded-full px-2 py-1 hover:bg-slate-900">
                      Month
                    </button>
                  </div>
                </div>
                {/* Placeholder chart */}
                <div className="grid grid-cols-7 gap-2 pt-3 text-[11px] text-slate-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, idx) => (
                      <div key={day} className="flex flex-col items-center gap-2">
                        <div className="flex h-24 w-6 items-end justify-center rounded-full bg-slate-900/80">
                          <div
                            className="w-4 rounded-full bg-gradient-to-t from-blue-500 to-amber-300"
                            style={{ height: `${40 + idx * 6}%` }}
                          />
                        </div>
                        <span>{day}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-4 shadow-xl shadow-black/60">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-100">Today&apos;s Tasks</p>
                  <button className="text-[11px] text-slate-400 hover:text-slate-200">
                    View all
                  </button>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start justify-between gap-2 rounded-2xl bg-slate-900/80 p-3">
                    <div>
                      <p className="font-medium text-slate-50">
                        Review Calculus Ch4 — Eigenvalues
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Math · Due tonight · 45 min
                      </p>
                    </div>
                    <input type="checkbox" className="mt-1 h-4 w-4" />
                  </li>
                  <li className="flex items-start justify-between gap-2 rounded-2xl bg-slate-900/80 p-3">
                    <div>
                      <p className="font-medium text-slate-50">
                        Generate notes from CS lecture
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Systems · Use Notes Generator
                      </p>
                    </div>
                    <input type="checkbox" className="mt-1 h-4 w-4" />
                  </li>
                  <li className="flex items-start justify-between gap-2 rounded-2xl bg-slate-900/80 p-3">
                    <div>
                      <p className="font-medium text-slate-50">
                        20 flashcards — Algorithms
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Practice mode · 15 min
                      </p>
                    </div>
                    <input type="checkbox" className="mt-1 h-4 w-4" />
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

