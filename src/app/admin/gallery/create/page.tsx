"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";
import {
  GALLERY_IMAGE_ACCEPT,
  getGalleryImageSizeError,
  getGalleryImageTypeError,
} from "@/lib/galleryUpload";

export default function CreateGalleryPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    is_published: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setMsg("");
    const typeError = getGalleryImageTypeError(file);

    if (typeError) {
      setMsg(typeError);
      return;
    }

    const sizeError = getGalleryImageSizeError(file);

    if (sizeError) {
      setMsg(sizeError);
      return;
    }

    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/admin/gallery/upload-image", {
        method: "POST",
        body,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(
          data?.message ||
            "Image upload failed. Please check the file type and size, then try again."
        );
        return;
      }

      set("image_url", data.url);
    } catch {
      setMsg(
        "Upload failed before the server returned a response. This usually means the file is too large or the network request was interrupted."
      );
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.image_url.trim()) {
      setMsg("Please upload an image.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/gallery/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create gallery item.");
      return;
    }

    window.location.href = "/admin/gallery";
  }

  return (
    <main>
      <PageHero title="Create Gallery Image" subtitle="Upload a new gallery image." />

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

            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900">
                Gallery Image *
              </label>

              <input
                type="file"
                accept={GALLERY_IMAGE_ACCEPT}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900"
              />

              <p className="mt-2 text-sm text-slate-500">
                Accepted: JPG, PNG, WebP, GIF, or AVIF up to 25 MB. Compressed
                images are recommended for faster uploads.
              </p>

              {uploading ? (
                <p className="mt-2 text-sm text-slate-600">Uploading image...</p>
              ) : null}

              {form.image_url ? (
                <div className="mt-4 overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt="Uploaded preview"
                    className="h-56 w-full object-cover"
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
              {loading ? "Saving..." : "Save Gallery Image"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
