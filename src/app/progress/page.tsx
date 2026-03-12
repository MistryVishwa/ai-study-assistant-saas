"use client";

import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type ProgressRow = {
  date: string;
  study_hours: number;
  topics_completed: number;
  quiz_score: number;
};

export default function ProgressPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [topics, setTopics] = useState(1);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const from = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error: qError } = await supabase
        .from("progress")
        .select("date,study_hours,topics_completed,quiz_score")
        .eq("user_id", user.id)
        .gte("date", from)
        .order("date", { ascending: true });
      if (qError) throw qError;

      setRows((data ?? []) as ProgressRow[]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to load progress.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logToday() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const today = format(new Date(), "yyyy-MM-dd");
      const { error: upsertError } = await supabase
        .from("progress")
        .upsert(
          {
            user_id: user.id,
            date: today,
            study_hours: Number(hours),
            topics_completed: Number(topics),
            quiz_score: 0,
          },
          { onConflict: "user_id,date" }
        );
      if (upsertError) throw upsertError;

      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to log progress.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = rows.map((r) => ({
    ...r,
    label: r.date.slice(5),
  }));

  return (
    <AppShell activePath="/progress">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-50">Study Hours</CardTitle>
                <p className="text-sm text-slate-400">Last 30 days</p>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(148,163,184,0.2)" }} />
                    <Line type="monotone" dataKey="study_hours" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-50">Log today</CardTitle>
                <p className="text-sm text-slate-400">Track your streak and reports.</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="grid gap-2">
                  <label className="text-xs text-slate-400">Study hours</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.25}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="border-slate-800/70 bg-slate-950/50 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs text-slate-400">Topics completed</label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={topics}
                    onChange={(e) => setTopics(Number(e.target.value))}
                    className="border-slate-800/70 bg-slate-950/50 text-slate-100"
                  />
                </div>
                <Button variant="gradient" onClick={logToday} disabled={loading}>
                  {loading ? "Saving…" : "Save"}
                </Button>
                <Button variant="outline" onClick={load} disabled={loading}>
                  Refresh
                </Button>
                {error ? <p className="text-sm text-amber-300">{error}</p> : null}
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Topics Completed</CardTitle>
              <p className="text-sm text-slate-400">Momentum over time</p>
            </CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(148,163,184,0.2)" }} />
                  <Bar dataKey="topics_completed" fill="#facc15" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

