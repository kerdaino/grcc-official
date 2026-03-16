"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  is_published: boolean;
};

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<BlogRow>({
    id: "",
    title: "",
    slug: "",
    author: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    is_published: false,
  });

  useEffect(() => {
    async function init() {
      const resolved = await params;

      const res = await fetch("/api/admin/blog/list", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Failed to load blog post.");
        setLoading(false);
        return;
      }

      const row = (data.rows || []).find((x: BlogRow) => x.id === resolved.id);

      if (!row) {
        setMsg("Blog post not found.");
        setLoading(false);
        return;
      }

      setForm({
        id: row.id,
        title: row.title || "",
        slug: row.slug || "",
        author: row.author || "",
        excerpt: row.excerpt || "",
        content: row.content || "",
        cover_image_url: row.cover_image_url || "",
        is_published: !!row.is_published,
      });

      setLoading(false);
    }

    init();
  }, [params]);

  function set<K extends keyof BlogRow>(key: K, value: BlogRow[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setUploading(true);
    setMsg("");

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/blog/upload-image", {
      method: "POST",
      body,
    });

    const data = await res.json().catch(() => null);
    setUploading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Image upload failed.");
      return;
    }

    set("cover_image_url", data.url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.title.trim()) {
      setMsg("Title is required.");
      return;
    }

    setSaving(true);

    const res = await fetch("/api/admin/blog/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to update blog post.");
      return;
    }

    setMsg("Blog post updated successfully.");
  }

  return (
    <main>
      <PageHero title="Edit Blog Post" subtitle="Update blog post details." />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          {loading ? (
            <div className="rounded-2xl border bg-slate-50 p-8 text-slate-600">
              Loading...
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="space-y-5 rounded-2xl border bg-white p-8 shadow-sm"
            >
              {msg ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
                  {msg}
                </div>
              ) : null}

              <Input label="Title *" value={form.title} onChange={(v) => set("title", v)} />
              <Input label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
              <Input label="Author" value={form.author || ""} onChange={(v) => set("author", v)} />
              <Textarea label="Excerpt" value={form.excerpt || ""} onChange={(v) => set("excerpt", v)} />
              <Textarea label="Content" value={form.content || ""} onChange={(v) => set("content", v)} />

              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Cover Image
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

                {form.cover_image_url ? (
                  <div className="mt-4 overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.cover_image_url}
                      alt="Blog preview"
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No cover image uploaded yet.
                  </p>
                )}
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
                disabled={saving || uploading}
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