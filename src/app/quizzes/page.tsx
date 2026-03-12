"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const QuizSchema = z.object({
  questions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("mcq"),
        question: z.string(),
        options: z.array(z.string()).min(2),
        answerIndex: z.number().int(),
        explanation: z.string().optional(),
      }),
      z.object({
        type: z.literal("tf"),
        question: z.string(),
        answer: z.boolean(),
        explanation: z.string().optional(),
      }),
      z.object({
        type: z.literal("short"),
        question: z.string(),
        answer: z.string(),
        explanation: z.string().optional(),
      }),
    ])
  ),
});

type Quiz = z.infer<typeof QuizSchema>;

export default function QuizzesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    setSubmitted(false);
    setQuiz(null);
    setAnswers({});
    const trimmed = notes.trim();
    if (trimmed.length < 40) {
      setError("Paste notes (at least ~40 characters) to generate a quiz.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Quiz generation failed");
      }
      const json = await res.json();
      const parsed = QuizSchema.safeParse(json);
      if (!parsed.success) throw new Error("Invalid quiz format returned by AI");
      setQuiz(parsed.data);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to generate quiz.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function scoreQuiz() {
    if (!quiz) return { score: 0, total: 0 };
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      const key = String(idx);
      if (q.type === "mcq") {
        if (answers[key] === q.answerIndex) correct++;
      } else if (q.type === "tf") {
        if (answers[key] === q.answer) correct++;
      } else {
        const user = String(answers[key] ?? "").trim().toLowerCase();
        const gold = q.answer.trim().toLowerCase();
        if (user && (user === gold || gold.includes(user) || user.includes(gold))) correct++;
      }
    });
    return { score: correct, total: quiz.questions.length };
  }

  async function submitAndSave() {
    if (!quiz) return;
    setError(null);
    setSubmitted(true);
    const { score, total } = scoreQuiz();

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save results.");

      const pct = total ? Math.round((score / total) * 100) : 0;
      const { error: insertError } = await supabase.from("quizzes").insert({
        user_id: user.id,
        score: pct,
        quiz,
      });
      if (insertError) throw insertError;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save quiz score.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  const result = submitted && quiz ? scoreQuiz() : null;

  return (
    <AppShell activePath="/quizzes">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">AI Quiz Generator</CardTitle>
              <p className="text-sm text-slate-400">
                Paste notes, generate MCQ / True-False / Short answers, then track your score.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[380px] border-slate-800/70 bg-slate-950/50 text-slate-100 placeholder:text-slate-500"
                placeholder="Paste your lecture notes here…"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{notes.trim().length.toLocaleString()} chars</p>
                <Button variant="gradient" onClick={generate} disabled={loading}>
                  {loading ? "Generating…" : "Generate quiz"}
                </Button>
              </div>
              {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Quiz</CardTitle>
              {result ? (
                <p className="text-sm text-slate-300">
                  Score: <span className="text-amber-200 font-semibold">{Math.round((result.score / result.total) * 100)}%</span>{" "}
                  ({result.score}/{result.total})
                </p>
              ) : (
                <p className="text-sm text-slate-400">Generate a quiz to begin.</p>
              )}
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="max-h-[520px] overflow-auto rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                {quiz ? (
                  <div className="space-y-4">
                    {quiz.questions.map((q, idx) => {
                      const key = String(idx);
                      return (
                        <div key={key} className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-3">
                          <p className="text-sm font-medium text-slate-100">
                            {idx + 1}. {q.question}
                          </p>
                          <div className="mt-2 text-sm text-slate-200">
                            {q.type === "mcq" ? (
                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                  <label key={optIdx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`q-${key}`}
                                      checked={answers[key] === optIdx}
                                      onChange={() => setAnswers((a) => ({ ...a, [key]: optIdx }))}
                                      disabled={submitted}
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            ) : q.type === "tf" ? (
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`q-${key}`}
                                    checked={answers[key] === true}
                                    onChange={() => setAnswers((a) => ({ ...a, [key]: true }))}
                                    disabled={submitted}
                                  />
                                  <span>True</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`q-${key}`}
                                    checked={answers[key] === false}
                                    onChange={() => setAnswers((a) => ({ ...a, [key]: false }))}
                                    disabled={submitted}
                                  />
                                  <span>False</span>
                                </label>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={String(answers[key] ?? "")}
                                onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                                disabled={submitted}
                                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
                                placeholder="Your answer…"
                              />
                            )}
                          </div>

                          {submitted ? (
                            <div className="mt-2 rounded-xl border border-slate-800/70 bg-slate-950/40 p-2 text-xs text-slate-300">
                              <p>
                                <span className="text-slate-400">Answer:</span>{" "}
                                {q.type === "mcq"
                                  ? q.options[q.answerIndex] ?? `Option ${q.answerIndex + 1}`
                                  : q.type === "tf"
                                    ? String(q.answer)
                                    : q.answer}
                              </p>
                              {q.explanation ? (
                                <p className="mt-1 text-slate-400">{q.explanation}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No quiz yet.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuiz(null);
                    setAnswers({});
                    setSubmitted(false);
                    setError(null);
                  }}
                  disabled={!quiz || loading}
                >
                  Reset
                </Button>
                <Button
                  variant="gradient"
                  onClick={submitAndSave}
                  disabled={!quiz || saving || loading}
                >
                  {saving ? "Saving…" : submitted ? "Saved" : "Submit & save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

