"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const KEY = "edupilot:notifications";

type Prefs = {
  emailReminders: boolean;
  weeklyReport: boolean;
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return { emailReminders: true, weeklyReport: true };
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
    return {
      emailReminders: parsed.emailReminders ?? true,
      weeklyReport: parsed.weeklyReport ?? true,
    };
  } catch {
    return { emailReminders: true, weeklyReport: true };
  }
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>({ emailReminders: true, weeklyReport: true });

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  function save() {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  }

  return (
    <ProtectedRoute>
      <AppShell activePath="/settings">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-4xl gap-4">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Settings</CardTitle>
              <p className="text-sm text-slate-400">Theme and notification preferences.</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-50">Theme</p>
                  <p className="text-xs text-slate-400">Toggle dark / light mode.</p>
                </div>
                <ThemeToggle />
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                <p className="text-sm font-semibold text-slate-50">Notifications</p>
                <div className="mt-3 space-y-3 text-sm text-slate-200">
                  <label className="flex items-center justify-between gap-3">
                    <span>Email reminders</span>
                    <input
                      type="checkbox"
                      checked={prefs.emailReminders}
                      onChange={(e) => setPrefs((p) => ({ ...p, emailReminders: e.target.checked }))}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span>Weekly report</span>
                    <input
                      type="checkbox"
                      checked={prefs.weeklyReport}
                      onChange={(e) => setPrefs((p) => ({ ...p, weeklyReport: e.target.checked }))}
                    />
                  </label>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" onClick={save}>
                    Save preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
    </ProtectedRoute>
  );
}

