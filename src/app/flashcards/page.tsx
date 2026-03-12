"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const CardsSchema = z.object({
  cards: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ),
});

type FlashcardRow = {
  id: string;
  question: string;
  answer: string;
  mastered: boolean;
  due_at: string;
};

export default function FlashcardsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardRow[]>([]);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  async function refreshCards() {
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error: qError } = await supabase
      .from("flashcards")
      .select("id,question,answer,mastered,due_at")
      .eq("user_id", user.id)
      .lte("due_at", today)
      .order("due_at", { ascending: true })
      .limit(100);
    if (qError) {
      setError(qError.message);
      return;
    }
    setCards((data ?? []) as FlashcardRow[]);
    setPracticeIdx(0);
    setShowAnswer(false);
  }

  useEffect(() => {
    refreshCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setError(null);
    const trimmed = notes.trim();
    if (trimmed.length < 40) {
      setError("Paste notes (at least ~40 characters) to generate flashcards.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes: trimmed, count: 20 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Flashcards generation failed");
      }
      const json = await res.json();
      const parsed = CardsSchema.safeParse(json);
      if (!parsed.success) throw new Error("Invalid flashcards format returned by AI");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save flashcards.");

      const today = format(new Date(), "yyyy-MM-dd");
      const rows = parsed.data.cards.map((c) => ({
        user_id: user.id,
        question: c.question,
        answer: c.answer,
        mastered: false,
        due_at: today,
      }));

      const { error: insertError } = await supabase.from("flashcards").insert(rows);
      if (insertError) throw insertError;

      await refreshCards();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to generate flashcards.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const current = cards[practiceIdx] ?? null;

  async function grade(action: "again" | "mastered") {
    if (!current) return;
    setError(null);
    const nextDue =
      action === "mastered" ? format(addDays(new Date(), 30), "yyyy-MM-dd") : format(addDays(new Date(), 2), "yyyy-MM-dd");
    const { error: upError } = await supabase
      .from("flashcards")
      .update({ mastered: action === "mastered", due_at: nextDue })
      .eq("id", current.id);
    if (upError) {
      setError(upError.message);
      return;
    }
    const next = practiceIdx + 1;
    setPracticeIdx(next);
    setShowAnswer(false);
    if (next >= cards.length) {
      await refreshCards();
    }
  }

  return (
    <AppShell activePath="/flashcards">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Flashcards Generator</CardTitle>
              <p className="text-sm text-slate-400">Generate flashcards from notes, then practice with simple spaced repetition.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[340px] border-slate-800/70 bg-slate-950/50 text-slate-100 placeholder:text-slate-500"
                placeholder="Paste your notes here…"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{notes.trim().length.toLocaleString()} chars</p>
                <Button variant="gradient" onClick={generate} disabled={loading}>
                  {loading ? "Generating…" : "Generate & save"}
                </Button>
              </div>
              {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Practice</CardTitle>
              <p className="text-sm text-slate-400">
                Due today: <span className="text-amber-200 font-semibold">{cards.length}</span>
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 p-5">
                {current ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Card {practiceIdx + 1} / {cards.length}</p>
                    <p className="text-base font-semibold text-slate-50">{current.question}</p>
                    {showAnswer ? (
                      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-3 text-sm text-slate-200">
                        {current.answer}
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setShowAnswer(true)}>
                        Reveal answer
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No due cards. Generate more, or come back later.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={refreshCards}>
                  Refresh
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => grade("again")}
                  disabled={!current || !showAnswer}
                >
                  Again (2d)
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => grade("mastered")}
                  disabled={!current || !showAnswer}
                >
                  Mastered (30d)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

