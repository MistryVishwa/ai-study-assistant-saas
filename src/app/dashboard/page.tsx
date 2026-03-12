"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("there");
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [topicsDone, setTopicsDone] = useState(0);
  const [avgQuiz, setAvgQuiz] = useState(0);
  const [chart, setChart] = useState<Array<{ label: string; hours: number }>>([]);
  const [todayTasks, setTodayTasks] = useState<
    Array<{ id: string; subject: string; task: string; status: string }>
  >([]);
  const [recentNotes, setRecentNotes] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const [ask, setAsk] = useState("");

  useEffect(() => {
    async function load() {
      const isDemo =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("demo") === "1";
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (isDemo) {
          setUserName("Demo");
          setWeeklyHours(18.4);
          setTopicsDone(12);
          setAvgQuiz(82);
          setChart(
            ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, idx) => ({
              label,
              hours: Number((1.5 + idx * 0.4).toFixed(1)),
            }))
          );
          setTodayTasks([
            { id: "t1", subject: "Math", task: "Review Calculus Ch4 — Eigenvalues", status: "pending" },
            { id: "t2", subject: "Systems", task: "Generate notes from CS lecture", status: "pending" },
            { id: "t3", subject: "Algorithms", task: "20 flashcards — Big-O practice", status: "pending" },
          ]);
          setRecentNotes([
            { id: "n1", title: "Lecture 12 — Linear Algebra", created_at: new Date().toISOString() },
            { id: "n2", title: "OS Scheduling — Summary", created_at: new Date().toISOString() },
          ]);
          setLoading(false);
          return;
        }
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      setUserName(profile?.full_name || user.email?.split("@")[0] || "there");

      const today = format(new Date(), "yyyy-MM-dd");
      const weekStart = format(subDays(new Date(), 6), "yyyy-MM-dd");

      const [{ data: progressRows }, { data: quizRows }, { data: tasks }, { data: notes }] =
        await Promise.all([
          supabase
            .from("progress")
            .select("date,study_hours,topics_completed")
            .eq("user_id", user.id)
            .gte("date", weekStart)
            .order("date", { ascending: true }),
          supabase
            .from("quizzes")
            .select("score,created_at")
            .eq("user_id", user.id)
            .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("study_plans")
            .select("id,subject,task,status")
            .eq("user_id", user.id)
            .eq("date", today)
            .order("created_at", { ascending: true })
            .limit(10),
          supabase
            .from("notes")
            .select("id,title,created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      const progress = (progressRows ?? []) as Array<{
        date: string;
        study_hours: number;
        topics_completed: number;
      }>;
      setWeeklyHours(progress.reduce((sum, r) => sum + Number(r.study_hours ?? 0), 0));
      setTopicsDone(progress.reduce((sum, r) => sum + Number(r.topics_completed ?? 0), 0));

      const quizzes = (quizRows ?? []) as Array<{ score: number }>;
      setAvgQuiz(
        quizzes.length
          ? quizzes.reduce((sum, q) => sum + Number(q.score ?? 0), 0) / quizzes.length
          : 0
      );

      const labels = progress.map((r) => ({
        label: r.date.slice(5),
        hours: Number(r.study_hours ?? 0),
      }));
      setChart(labels);
      setTodayTasks((tasks ?? []) as any);
      setRecentNotes((notes ?? []) as any);

      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <AppShell activePath="/dashboard">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.14),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <section className="mb-4 overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40 p-5 shadow-2xl shadow-amber-500/25 backdrop-blur-2xl md:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-amber-200">
            Welcome back
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-50 md:text-2xl">
            {userName}, ready to study?
          </h1>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-xl">
              <Input
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                placeholder="Quick ask: “Explain eigenvalues…”"
                className="rounded-full border-slate-800/70 bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <Link href={ask.trim() ? `/tutor?seed=${encodeURIComponent(ask.trim())}` : "/tutor"}>
                <Button variant="gradient">Ask AI Tutor</Button>
              </Link>
              <Link href="/planner">
                <Button variant="outline">Plan week</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <StatCard
            label="Study Hours (7d)"
            value={`${weeklyHours.toFixed(1)}h`}
            helper={weeklyHours > 0 ? "Keep the streak going" : "Log your first session"}
          />
          <StatCard
            label="Topics Completed (7d)"
            value={topicsDone.toString()}
            helper={topicsDone > 0 ? "Nice progress" : "Pick one topic today"}
          />
          <StatCard
            label="Avg Quiz Score (7d)"
            value={`${avgQuiz.toFixed(0)}%`}
            helper={avgQuiz > 0 ? "Based on recent quizzes" : "Take a quiz to start tracking"}
          />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="border-slate-800/70 bg-slate-950/80 shadow-xl shadow-black/60 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Study hours analytics</CardTitle>
              <p className="text-sm text-slate-400">Last 7 days</p>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0b1220",
                      border: "1px solid rgba(148,163,184,0.2)",
                    }}
                  />
                  <Line type="monotone" dataKey="hours" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/80 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Today’s AI tasks</CardTitle>
              <p className="text-sm text-slate-400">{format(new Date(), "MMM dd")}</p>
            </CardHeader>
            <CardContent>
              {todayTasks.length ? (
                <ul className="space-y-2 text-sm">
                  {todayTasks.map((t) => (
                    <li key={t.id} className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-3">
                      <p className="font-medium text-slate-50">{t.task}</p>
                      <p className="text-[11px] text-slate-400">{t.subject}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No tasks scheduled. Generate one in <Link className="text-amber-200 underline underline-offset-4" href="/planner">Planner</Link>.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="border-slate-800/70 bg-slate-950/80 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Recent lectures / notes</CardTitle>
              <p className="text-sm text-slate-400">Your latest generated notes</p>
            </CardHeader>
            <CardContent>
              {recentNotes.length ? (
                <ul className="space-y-2 text-sm">
                  {recentNotes.map((n) => (
                    <li key={n.id} className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/40 p-3">
                      <div>
                        <p className="font-medium text-slate-50">{n.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Link href="/notes" className="text-xs text-sky-300 hover:text-sky-200">
                        Open →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">
                  No notes yet. Generate your first set in <Link className="text-amber-200 underline underline-offset-4" href="/notes">AI Notes</Link>.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/80 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Quick actions</CardTitle>
              <p className="text-sm text-slate-400">Jump into core workflows</p>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/tutor">
                <Button className="w-full" variant="gradient">
                  Ask AI Tutor
                </Button>
              </Link>
              <Link href="/notes">
                <Button className="w-full" variant="outline">
                  Generate notes
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button className="w-full" variant="outline">
                  Generate quiz
                </Button>
              </Link>
              <Link href="/flashcards">
                <Button className="w-full" variant="outline">
                  Flashcards practice
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}

