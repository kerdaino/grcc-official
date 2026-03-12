"use client";

import PageHero from "@/components/PageHero";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type GalleryRow = {
  id: string;
  title: string | null;
  image_url: string;
  is_published: boolean;
  created_at: string;
};

export default function AdminGalleryPage() {
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const res = await fetch("/api/admin/gallery/list", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setErr(data?.message || "Failed to load gallery");
      setLoading(false);
      return;
    }

    setRows(data.rows || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const text = q.trim().toLowerCase();
    return rows.filter((r) =>
      !text ? true : (r.title || "").toLowerCase().includes(text)
    );
  }, [rows, q]);

  async function removeImage(id: string) {
    const ok = confirm("Are you sure you want to delete this image?");
    if (!ok) return;

    const res = await fetch("/api/admin/gallery/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Delete failed");
      return;
    }

    await load();
  }

  async function togglePublish(row: GalleryRow) {
    const res = await fetch("/api/admin/gallery/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        title: row.title || "",
        image_url: row.image_url,
        is_published: !row.is_published,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Update failed");
      return;
    }

    await load();
  }

  return (
    <main>
      <PageHero
        title="Admin — Gallery"
        subtitle="Upload, publish, unpublish, and remove gallery images."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title..."
                className="w-full md:w-[360px] rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
              />

              <button
                onClick={load}
                className="rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800"
              >
                Refresh
              </button>

              <Link
                href="/admin/gallery/create"
                className="rounded-lg bg-fuchsia-600 px-5 py-3 text-white font-semibold hover:bg-fuchsia-700"
              >
                + New Gallery Image
              </Link>
            </div>
          </div>

          {err ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {loading ? (
              <div className="col-span-full rounded-2xl border bg-slate-50 p-8 text-slate-600">
                Loading...
              </div>
            ) : visible.length === 0 ? (
              <div className="col-span-full rounded-2xl border bg-slate-50 p-8 text-slate-600">
                No gallery images found.
              </div>
            ) : (
              visible.map((row) => (
                <div
                  key={row.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >
                  <div className="h-52 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.image_url}
                      alt={row.title || "Gallery"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <p className="font-bold text-slate-900">
                      {row.title || "Untitled"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.is_published ? "Published" : "Draft / Unpublished"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/admin/gallery/${row.id}`}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => togglePublish(row)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                          row.is_published
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-teal-600 hover:bg-teal-700"
                        }`}
                      >
                        {row.is_published ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => removeImage(row.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}