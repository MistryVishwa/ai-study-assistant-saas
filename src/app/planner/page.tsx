"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

import "react-day-picker/dist/style.css";

const PlannerSchema = z.object({
  weeklyPlan: z.array(z.object({ weekStart: z.string(), focus: z.string() })).optional(),
  tasks: z.array(
    z.object({
      date: z.string(),
      subject: z.string(),
      task: z.string(),
      status: z.string().optional(),
    })
  ),
});

type Planner = z.infer<typeof PlannerSchema>;

export default function PlannerPage() {
  const supabase = useMemo(() => createClient(), []);
  const [subjectsRaw, setSubjectsRaw] = useState("Math, Physics");
  const [weakRaw, setWeakRaw] = useState("Math");
  const [examDate, setExamDate] = useState<string>(() => format(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), "yyyy-MM-dd"));
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Planner | null>(null);
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Array<{ id: string; date: string; subject: string; task: string; status: string }>>([]);

  async function loadTasks() {
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error: qError } = await supabase
      .from("study_plans")
      .select("id,date,subject,task,status")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .limit(500);
    if (qError) {
      setError(qError.message);
      return;
    }
    setTasks((data ?? []) as any);
  }

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generatePlan() {
    setError(null);
    setLoading(true);
    try {
      const subjects = subjectsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const weakSubjects = weakRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/ai/planner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjects,
          examDate,
          hoursPerDay: Number(hoursPerDay),
          weakSubjects,
          startDate: format(new Date(), "yyyy-MM-dd"),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Planner generation failed");
      }
      const json = await res.json();
      const parsed = PlannerSchema.safeParse(json);
      if (!parsed.success) throw new Error("Invalid plan format returned by AI");
      setPlan(parsed.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to generate plan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    if (!plan?.tasks?.length) return;
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save a plan.");

      const rows = plan.tasks.map((t) => ({
        user_id: user.id,
        subject: t.subject,
        task: t.task,
        date: t.date,
        status: "pending",
      }));
      const { error: insertError } = await supabase.from("study_plans").insert(rows);
      if (insertError) throw insertError;
      await loadTasks();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save plan.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const selectedDate = selected ? format(selected, "yyyy-MM-dd") : null;
  const tasksForSelected = selectedDate
    ? tasks.filter((t) => t.date === selectedDate)
    : [];

  const daysWithTasks = useMemo(() => {
    const set = new Set(tasks.map((t) => t.date));
    return Array.from(set).map((d) => new Date(d + "T00:00:00"));
  }, [tasks]);

  return (
    <AppShell activePath="/planner">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">AI Study Planner</CardTitle>
              <p className="text-sm text-slate-400">
                Provide a few details and EduPilot will generate a full schedule and daily tasks.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Subjects (comma-separated)</label>
                <Input value={subjectsRaw} onChange={(e) => setSubjectsRaw(e.target.value)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Exam date</label>
                <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Study hours per day</label>
                <Input type="number" min={0.5} step={0.5} value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Weak subjects (comma-separated)</label>
                <Input value={weakRaw} onChange={(e) => setWeakRaw(e.target.value)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPlan(null)} disabled={loading}>
                  Clear
                </Button>
                <Button variant="gradient" onClick={generatePlan} disabled={loading}>
                  {loading ? "Generating…" : "Generate plan"}
                </Button>
              </div>

              {plan ? (
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3 text-sm text-slate-200">
                  <p className="font-medium text-slate-50">Weekly focus</p>
                  <Textarea
                    readOnly
                    value={(plan.weeklyPlan ?? []).map((w) => `${w.weekStart}: ${w.focus}`).join("\n") || "Generated. Save to create daily tasks."}
                    className="mt-2 min-h-[120px] border-slate-800/70 bg-slate-950/50 text-slate-100"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" onClick={savePlan} disabled={loading}>
                      Save tasks to database
                    </Button>
                  </div>
                </div>
              ) : null}

              {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Calendar</CardTitle>
              <p className="text-sm text-slate-400">Select a day to see tasks.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={setSelected}
                  modifiers={{ hasTasks: daysWithTasks }}
                  modifiersClassNames={{
                    hasTasks: "bg-amber-500/20 text-amber-100 rounded-md",
                  }}
                />
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-50">
                    Tasks for {selectedDate ?? "—"}
                  </p>
                  <Button variant="outline" onClick={loadTasks}>
                    Refresh
                  </Button>
                </div>
                {tasksForSelected.length ? (
                  <ul className="mt-3 space-y-2 text-sm">
                    {tasksForSelected.map((t) => (
                      <li key={t.id} className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-3">
                        <p className="font-medium text-slate-100">{t.subject}</p>
                        <p className="text-xs text-slate-400">{t.task}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No tasks for this day.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

