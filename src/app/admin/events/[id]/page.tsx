"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  is_published: boolean;
};

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<EventRow>({
    id: "",
    title: "",
    slug: "",
    event_date: "",
    event_time: "",
    location: "",
    description: "",
    image_url: "",
    is_published: false,
  });

  useEffect(() => {
    async function init() {
      const resolved = await params;

      const res = await fetch("/api/admin/events/list", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Failed to load event.");
        setLoading(false);
        return;
      }

      const row = (data.rows || []).find((x: EventRow) => x.id === resolved.id);

      if (!row) {
        setMsg("Event not found.");
        setLoading(false);
        return;
      }

      setForm({
        id: row.id,
        title: row.title || "",
        slug: row.slug || "",
        event_date: row.event_date || "",
        event_time: row.event_time || "",
        location: row.location || "",
        description: row.description || "",
        image_url: row.image_url || "",
        is_published: !!row.is_published,
      });

      setLoading(false);
    }

    init();
  }, [params]);

  function set<K extends keyof EventRow>(key: K, value: EventRow[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.title.trim()) {
      setMsg("Title is required.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/admin/events/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to update event.");
      return;
    }

    setMsg("Event updated successfully.");
  }

  return (
    <main>
      <PageHero title="Edit Event" subtitle="Update event details." />

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
              <Input label="Event Date" type="date" value={form.event_date || ""} onChange={(v) => set("event_date", v)} />
              <Input label="Event Time" value={form.event_time || ""} onChange={(v) => set("event_time", v)} />
              <Input label="Location" value={form.location || ""} onChange={(v) => set("location", v)} />
              <Textarea label="Description" value={form.description || ""} onChange={(v) => set("description", v)} />
              <Input label="Image URL" value={form.image_url || ""} onChange={(v) => set("image_url", v)} />

              <label className="flex items-center gap-3 text-slate-900 font-medium">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => set("is_published", e.target.checked)}
                />
                Published
              </label>

              <button
                disabled={saving}
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