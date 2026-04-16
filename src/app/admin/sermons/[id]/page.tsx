"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type Sermon = {
  id: string;
  title: string;
  slug: string;
  preacher: string | null;
  sermon_date: string | null;
  scripture: string | null;
  summary: string | null;
  youtube_url: string | null;
  audio_url: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
};

export default function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<Sermon>({
    id: "",
    title: "",
    slug: "",
    preacher: "",
    sermon_date: "",
    scripture: "",
    summary: "",
    youtube_url: "",
    audio_url: "",
    thumbnail_url: "",
    is_published: false,
  });

  useEffect(() => {
    async function init() {
      const resolved = await params;

      const res = await fetch("/api/admin/sermons/list", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Failed to load sermon.");
        setLoading(false);
        return;
      }

      const row = (data.rows || []).find((x: Sermon) => x.id === resolved.id);

      if (!row) {
        setMsg("Sermon not found.");
        setLoading(false);
        return;
      }

      setForm({
        id: row.id,
        title: row.title || "",
        slug: row.slug || "",
        preacher: row.preacher || "",
        sermon_date: row.sermon_date || "",
        scripture: row.scripture || "",
        summary: row.summary || "",
        youtube_url: row.youtube_url || "",
        audio_url: row.audio_url || "",
        thumbnail_url: row.thumbnail_url || "",
        is_published: !!row.is_published,
      });

      setLoading(false);
    }

    init();
  }, [params]);

  function set<K extends keyof Sermon>(key: K, value: Sermon[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageChange(file: File | null) {
    if (!file) return;

    setUploadingImage(true);
    setMsg("");

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/sermons/upload-image", {
      method: "POST",
      body,
    });

    const data = await res.json().catch(() => null);
    setUploadingImage(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Thumbnail upload failed.");
      return;
    }

    set("thumbnail_url", data.url);
  }

  async function handleAudioChange(file: File | null) {
    if (!file) return;

    setUploadingAudio(true);
    setMsg("");

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/sermons/upload-audio", {
      method: "POST",
      body,
    });

    const data = await res.json().catch(() => null);
    setUploadingAudio(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Audio upload failed.");
      return;
    }

    set("audio_url", data.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.title.trim()) {
      setMsg("Title is required.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/admin/sermons/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to update sermon.");
      return;
    }

    setMsg("Sermon updated successfully.");
  }

  return (
    <main>
      <PageHero title="Edit Sermon" subtitle="Update sermon details." />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {loading ? (
            <div className="rounded-2xl border bg-slate-50 p-8 text-slate-600">
              Loading...
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
              {msg ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  {msg}
                </div>
              ) : null}

              <Input label="Title *" value={form.title} onChange={(v) => set("title", v)} />
              <Input label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
              <Input label="Preacher" value={form.preacher || ""} onChange={(v) => set("preacher", v)} />
              <Input
                label="Sermon Date"
                type="date"
                value={form.sermon_date || ""}
                onChange={(v) => set("sermon_date", v)}
              />
              <Input label="Scripture" value={form.scripture || ""} onChange={(v) => set("scripture", v)} />
              <Textarea label="Summary" value={form.summary || ""} onChange={(v) => set("summary", v)} />
              <Input label="YouTube URL" value={form.youtube_url || ""} onChange={(v) => set("youtube_url", v)} />

              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Thumbnail Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900"
                />

                {uploadingImage ? (
                  <p className="mt-2 text-sm text-slate-600">Uploading thumbnail...</p>
                ) : null}

                {form.thumbnail_url ? (
                  <div className="mt-4 overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.thumbnail_url}
                      alt="Thumbnail preview"
                      className="h-52 w-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No thumbnail uploaded yet.</p>
                )}

                <Input
                  label="Thumbnail URL (optional)"
                  value={form.thumbnail_url || ""}
                  onChange={(v) => set("thumbnail_url", v)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Audio File
                </label>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleAudioChange(e.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900"
                />

                {uploadingAudio ? (
                  <p className="mt-2 text-sm text-slate-600">Uploading audio...</p>
                ) : null}

                {form.audio_url ? (
                  <audio controls className="mt-4 w-full">
                    <source src={form.audio_url || ""} />
                    Your browser does not support audio playback.
                  </audio>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No audio uploaded yet.</p>
                )}

                <Input
                  label="Audio URL or Telegram Post Link (optional)"
                  value={form.audio_url || ""}
                  onChange={(v) => set("audio_url", v)}
                />
              </div>

              <label className="flex items-center gap-3 text-slate-900 font-medium">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => set("is_published", e.target.checked)}
                />
                Published
              </label>

              <button
                disabled={saving || uploadingImage || uploadingAudio}
                className="rounded-lg bg-fuchsia-600 px-6 py-3 font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 min-h-[140px] w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
      />
    </div>
  );
}
