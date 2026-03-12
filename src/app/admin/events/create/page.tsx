"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    event_date: "",
    event_time: "",
    location: "",
    description: "",
    image_url: "",
    is_published: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setUploading(true);
    setMsg("");

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/events/upload-image", {
      method: "POST",
      body,
    });

    const data = await res.json().catch(() => null);
    setUploading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Image upload failed.");
      return;
    }

    set("image_url", data.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.title.trim()) {
      setMsg("Title is required.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create event.");
      return;
    }

    window.location.href = "/admin/events";
  }

  return (
    <main>
      <PageHero title="Create Event" subtitle="Add a new event entry." />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <form
            onSubmit={submit}
            className="space-y-5 rounded-2xl border bg-white p-8 shadow-sm"
          >
            {msg ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {msg}
              </div>
            ) : null}

            <Input label="Title *" value={form.title} onChange={(v) => set("title", v)} />
            <Input label="Slug (optional)" value={form.slug} onChange={(v) => set("slug", v)} />
            <Input label="Event Date" type="date" value={form.event_date} onChange={(v) => set("event_date", v)} />
            <Input label="Event Time" value={form.event_time} onChange={(v) => set("event_time", v)} />
            <Input label="Location" value={form.location} onChange={(v) => set("location", v)} />
            <Textarea label="Description" value={form.description} onChange={(v) => set("description", v)} />

            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Event Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900"
              />

              {uploading ? (
                <p className="mt-2 text-sm text-slate-600">Uploading image...</p>
              ) : null}

              {form.image_url ? (
                <div className="mt-4 overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt="Uploaded preview"
                    className="h-52 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <label className="flex items-center gap-3 font-medium text-slate-900">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
              />
              Publish immediately
            </label>

            <button
              disabled={loading || uploading}
              className="rounded-lg bg-fuchsia-600 px-6 py-3 font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Event"}
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