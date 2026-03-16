"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    author: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
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

    setLoading(true);

    const res = await fetch("/api/admin/blog/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create blog post.");
      return;
    }

    window.location.href = "/admin/blog";
  }

  return (
    <main>
      <PageHero title="Create Blog Post" subtitle="Add a new blog post." />

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
            <Input label="Author" value={form.author} onChange={(v) => set("author", v)} />
            <Textarea label="Excerpt" value={form.excerpt} onChange={(v) => set("excerpt", v)} />
            <Textarea label="Content" value={form.content} onChange={(v) => set("content", v)} />

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
                    alt="Uploaded preview"
                    className="h-56 w-full object-cover"
                  />
                </div>
              ) : null}
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
              disabled={loading || uploading}
              className="rounded-lg bg-fuchsia-600 px-6 py-3 font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Post"}
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