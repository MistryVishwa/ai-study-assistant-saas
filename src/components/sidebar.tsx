import Link from "next/link";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Notes Generator", href: "/notes" },
  { label: "AI Tutor", href: "/tutor" },
  { label: "Voice Assistant", href: "/voice-assistant" },
  { label: "Study Planner", href: "/planner" },
  { label: "Lectures", href: "/lectures" },
];

const practiceNav = [
  { label: "Flashcards", href: "/flashcards" },
  { label: "Quiz System", href: "/quizzes" },
  { label: "Progress", href: "/progress" },
];

const exploreNav = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Blog", href: "/blog" },
];

interface SidebarProps {
  activePath?: string;
}

export function Sidebar({ activePath }: SidebarProps) {
  const isActive = (href: string) =>
    activePath ? activePath === href : href === "/dashboard";

  return (
    <aside className="hidden h-full w-64 flex-none flex-col border-r border-slate-800/70 bg-slate-950/90 px-4 py-4 shadow-xl shadow-black/70 backdrop-blur-2xl md:flex">
      <div className="mb-6 flex items-center gap-3 px-1">
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

      <nav className="flex-1 space-y-6 text-sm text-slate-300">
        <div>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Learn
          </p>
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 transition-colors",
                    "border border-transparent",
                    isActive(item.href)
                      ? "border-amber-400/70 bg-amber-400/10 text-amber-100"
                      : "hover:border-slate-700/80 hover:bg-slate-900/70 hover:text-slate-100"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Practice
          </p>
          <ul className="space-y-1">
            {practiceNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 transition-colors",
                    "border border-transparent",
                    isActive(item.href)
                      ? "border-amber-400/70 bg-amber-400/10 text-amber-100"
                      : "hover:border-slate-700/80 hover:bg-slate-900/70 hover:text-slate-100"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Explore
          </p>
          <ul className="space-y-1">
            {exploreNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 transition-colors",
                    "border border-transparent",
                    isActive(item.href)
                      ? "border-amber-400/70 bg-amber-400/10 text-amber-100"
                      : "hover:border-slate-700/80 hover:bg-slate-900/70 hover:text-slate-100"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

