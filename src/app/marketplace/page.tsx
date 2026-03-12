"use client";

import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type MaterialRow = {
  id: string;
  title: string;
  file_url: string;
  rating: number;
  price: number;
  created_at: string;
};

export default function MarketplacePage() {
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);

  async function load() {
    const { data, error: qError } = await supabase
      .from("materials")
      .select("id,title,file_url,rating,price,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (qError) {
      setError(qError.message);
      return;
    }
    setMaterials((data ?? []) as MaterialRow[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upload() {
    setError(null);
    if (!title.trim()) {
      setError("Enter a title.");
      return;
    }
    if (!file) {
      setError("Choose a PDF or file to upload.");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload materials.");

      const path = `${user.id}/${Date.now()}-${nanoid()}-${file.name}`;
      const { error: upError } = await supabase.storage
        .from("materials")
        .upload(path, file, { upsert: false });
      if (upError) throw upError;

      const { data: pub } = supabase.storage.from("materials").getPublicUrl(path);
      const fileUrl = pub.publicUrl;

      const { error: insertError } = await supabase.from("materials").insert({
        user_id: user.id,
        title: title.trim(),
        file_url: fileUrl,
        price: Number(price) || 0,
        rating: 0,
      });
      if (insertError) throw insertError;

      setTitle("");
      setPrice(0);
      setFile(null);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to upload material.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell activePath="/marketplace">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60 md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Upload material</CardTitle>
              <p className="text-sm text-slate-400">
                Share notes & PDFs. Supports free and premium resources.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Price (0 = free)</label>
                <Input type="number" min={0} step={0.5} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">File</label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>

              <Button variant="gradient" onClick={upload} disabled={loading}>
                {loading ? "Uploading…" : "Upload"}
              </Button>
              {error ? <p className="text-sm text-amber-300">{error}</p> : null}
              <p className="text-xs text-slate-500">
                Requires a Supabase Storage bucket named <span className="text-slate-300">materials</span> (public).
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Marketplace</CardTitle>
              <p className="text-sm text-slate-400">Download study materials and share your own.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex justify-end">
                <Button variant="outline" onClick={load}>
                  Refresh
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {materials.map((m) => (
                  <a
                    key={m.id}
                    href={m.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 transition hover:border-sky-500/60"
                  >
                    <p className="text-sm font-semibold text-slate-50">{m.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {m.price > 0 ? `$${m.price}` : "Free"} · Rating {Number(m.rating).toFixed(1)}
                    </p>
                    <p className="mt-3 text-xs text-sky-300">Open file →</p>
                  </a>
                ))}
                {materials.length === 0 ? (
                  <p className="text-sm text-slate-400">No materials yet.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

