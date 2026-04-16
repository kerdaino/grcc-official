"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";

export default function CreateSermonPage() {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
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

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
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

    setLoading(true);

    const res = await fetch("/api/admin/sermons/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create sermon.");
      return;
    }

    window.location.href = "/admin/sermons";
  }

  return (
    <main>
      <PageHero title="Create Sermon" subtitle="Add a new sermon entry." />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
            {msg ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {msg}
              </div>
            ) : null}

            <Input label="Title *" value={form.title} onChange={(v) => set("title", v)} />
            <Input label="Slug (optional)" value={form.slug} onChange={(v) => set("slug", v)} />
            <Input label="Preacher" value={form.preacher} onChange={(v) => set("preacher", v)} />
            <Input
              label="Sermon Date"
              type="date"
              value={form.sermon_date}
              onChange={(v) => set("sermon_date", v)}
            />
            <Input label="Scripture" value={form.scripture} onChange={(v) => set("scripture", v)} />
            <Textarea label="Summary" value={form.summary} onChange={(v) => set("summary", v)} />
            <Input label="YouTube URL" value={form.youtube_url} onChange={(v) => set("youtube_url", v)} />

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
              ) : null}

              <Input
                label="Thumbnail URL (optional)"
                value={form.thumbnail_url}
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
                  <source src={form.audio_url} />
                  Your browser does not support audio playback.
                </audio>
              ) : null}

              <Input
                label="Audio URL or Telegram Post Link (optional)"
                value={form.audio_url}
                onChange={(v) => set("audio_url", v)}
              />
            </div>

            <label className="flex items-center gap-3 text-slate-900 font-medium">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
              />
              Publish immediately
            </label>

            <button
              disabled={loading || uploadingImage || uploadingAudio}
              className="rounded-lg bg-fuchsia-600 px-6 py-3 font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Sermon"}
            </button>
          </form>
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
