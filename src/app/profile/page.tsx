"use client";

import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  learning_goal: string | null;
};

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error: qError } = await supabase
      .from("profiles")
      .select("id,full_name,email,avatar_url,learning_goal")
      .eq("id", user.id)
      .maybeSingle();
    if (qError) {
      setError(qError.message);
      return;
    }
    const p = (data as ProfileRow | null) ?? null;
    setProfile(p);
    setName(p?.full_name ?? "");
    setGoal(p?.learning_goal ?? "");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    setError(null);
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { error: upError } = await supabase
        .from("profiles")
        .update({ full_name: name || null, learning_goal: goal || null })
        .eq("id", user.id);
      if (upError) throw upError;

      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to save profile.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar() {
    setError(null);
    if (!avatarFile) {
      setError("Choose an image first.");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const ext = avatarFile.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}-${nanoid()}.${ext}`;
      const { error: upError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
      if (upError) throw upError;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = pub.publicUrl;

      const { error: profError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);
      if (profError) throw profError;

      setAvatarFile(null);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to upload avatar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    setError(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
      if (passError) throw passError;
      setNewPassword("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to change password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell activePath="/profile">
      <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.12),_transparent_55%),linear-gradient(to_bottom_right,_#020617,_#020617)] px-4 pb-6 pt-4 md:px-6">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Profile</CardTitle>
              <p className="text-sm text-slate-400">Update your personal info and avatar.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Email</label>
                <Input value={profile?.email ?? ""} readOnly className="border-slate-800/70 bg-slate-950/50 text-slate-100 opacity-90" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">Learning goal</label>
                <Input value={goal} onChange={(e) => setGoal(e.target.value)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" placeholder="e.g. exam prep, self-learning" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={load} disabled={loading}>
                  Refresh
                </Button>
                <Button variant="gradient" onClick={saveProfile} disabled={loading}>
                  {loading ? "Saving…" : "Save"}
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-3">
                <p className="text-sm font-semibold text-slate-50">Profile picture</p>
                <div className="mt-2 grid gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="border-slate-800/70 bg-slate-950/50 text-slate-100" />
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={uploadAvatar} disabled={loading || !avatarFile}>
                      Upload avatar
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Requires a Supabase Storage bucket named <span className="text-slate-300">avatars</span> (public).
                  </p>
                </div>
              </div>

              {error ? <p className="text-sm text-amber-300">{error}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-slate-800/70 bg-slate-950/70 shadow-xl shadow-black/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-50">Security</CardTitle>
              <p className="text-sm text-slate-400">Change your password anytime.</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-slate-400">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-slate-800/70 bg-slate-950/50 text-slate-100"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="gradient" onClick={changePassword} disabled={loading || newPassword.length < 8}>
                  {loading ? "Updating…" : "Update password"}
                </Button>
              </div>
              {profile?.avatar_url ? (
                <a
                  href={profile.avatar_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-300 hover:text-sky-200 underline underline-offset-4"
                >
                  View current avatar
                </a>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}

