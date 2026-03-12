"use client";

import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { nanoid } from "nanoid";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTutorChatStore } from "@/stores/tutorChatStore";

function useMarkdownComponents() {
  return useMemo(
    () => ({
      a: (props: any) => (
        <a
          {...props}
          className="text-sky-400 hover:text-sky-300 underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        />
      ),
      code: (props: any) => (
        <code
          {...props}
          className="rounded bg-slate-900/70 px-1 py-0.5 text-[0.9em] text-slate-100"
        />
      ),
      pre: (props: any) => (
        <pre
          {...props}
          className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm"
        />
      ),
      ul: (props: any) => <ul {...props} className="list-disc pl-5" />,
      ol: (props: any) => <ol {...props} className="list-decimal pl-5" />,
    }),
    []
  );
}

export default function TutorPage() {
  const { messages, pending, addMessage, setPending } = useTutorChatStore();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const md = useMarkdownComponents();

  async function send() {
    const content = draft.trim();
    if (!content || pending) return;

    setDraft("");
    const userMsg = { id: nanoid(), role: "user" as const, content, createdAt: Date.now() };
    addMessage(userMsg);
    setPending(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Tutor request failed");
      }
      const data = (await res.json()) as { text: string };
      addMessage({ id: nanoid(), role: "assistant", content: data.text, createdAt: Date.now() });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to reach tutor.";
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: `Sorry — I ran into an error: **${message}**`,
        createdAt: Date.now(),
      });
    } finally {
      setPending(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0);
    }
  }

  return (
    <AppShell activePath="/tutor">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-5xl gap-4">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">AI Tutor</CardTitle>
              <p className="text-sm text-slate-400">
                Ask anything — I’ll explain step-by-step with simple examples.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ScrollArea className="h-[55vh] rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 text-sm text-slate-300">
                      Try: “Explain eigenvalues intuitively, with a real-life example.”
                    </div>
                  ) : null}

                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[85%] rounded-2xl bg-gradient-to-r from-sky-500/90 to-blue-600/90 p-3 text-sm text-slate-950"
                          : "mr-auto max-w-[85%] rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3 text-sm text-slate-100"
                      }
                    >
                      {m.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                          {m.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  ))}

                  {pending ? (
                    <div className="mr-auto max-w-[85%] rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3 text-sm text-slate-300">
                      Thinking…
                    </div>
                  ) : null}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="grid gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your question…"
                  className="min-h-[110px] border-slate-800/70 bg-slate-950/50 text-slate-100 placeholder:text-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Send with Ctrl/⌘ + Enter</p>
                  <Button variant="gradient" onClick={send} disabled={pending || !draft.trim()}>
                    {pending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

