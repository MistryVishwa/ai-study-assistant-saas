"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Use workerless mode for compatibility with Next.js builds.
  // @ts-expect-error - pdfjs typing varies across versions
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableWorker: true }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str);
    fullText += strings.join(" ") + "\n";
  }
  return fullText.trim();
}

export default function NotesPage() {
  const [title, setTitle] = useState("Lecture Notes");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function handlePdfUpload(file: File | null) {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const extracted = await extractPdfText(file);
      setText(extracted);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to read PDF.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setError(null);
    const trimmed = text.trim();
    if (trimmed.length < 40) {
      setError("Paste text or upload a PDF with at least ~40 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, text: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Notes generation failed");
      }
      const data = (await res.json()) as { markdown: string };
      setMarkdown(data.markdown);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to generate notes.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveToLibrary() {
    setError(null);
    if (!markdown.trim()) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save notes.");

      const { error: insertError } = await supabase.from("notes").insert({
        user_id: user.id,
        title: title || "AI Notes",
        content: markdown,
      });
      if (insertError) throw insertError;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save notes.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell activePath="/notes">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">AI Notes Generator</CardTitle>
              <p className="text-sm text-slate-400">
                Upload a PDF or paste lecture text. EduPilot returns clean revision notes.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-slate-800/70 bg-slate-950/50 text-slate-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Upload PDF</label>
                <Input
                  type="file"
                  accept="application/pdf"
                  className="border-slate-800/70 bg-slate-950/50 text-slate-100"
                  onChange={(e) => handlePdfUpload(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Or paste lecture text</label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your lecture transcript, slides text, or reading notes…"
                  className="min-h-[260px] border-slate-800/70 bg-slate-950/50 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {text.trim().length.toLocaleString()} chars
                </p>
                <Button variant="gradient" onClick={generate} disabled={loading}>
                  {loading ? "Generating…" : "Generate notes"}
                </Button>
              </div>

              {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Generated Notes</CardTitle>
              <p className="text-sm text-slate-400">Markdown-ready output (copy or save).</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="h-[520px] overflow-auto rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm text-slate-100">
                {markdown ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400">Generate notes to preview them here.</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={saveToLibrary}
                  disabled={saving || !markdown.trim()}
                >
                  {saving ? "Saving…" : "Save to library"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

