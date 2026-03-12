"use client";

import PageHero from "@/components/PageHero";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function AdminEventsPage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const res = await fetch("/api/admin/events/list", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setErr(data?.message || "Failed to load events");
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
    return rows.filter((r) => {
      if (!text) return true;
      return (
        (r.title || "").toLowerCase().includes(text) ||
        (r.location || "").toLowerCase().includes(text) ||
        (r.slug || "").toLowerCase().includes(text)
      );
    });
  }, [rows, q]);

  async function removeEvent(id: string) {
    const ok = confirm("Are you sure you want to delete this event?");
    if (!ok) return;

    const res = await fetch("/api/admin/events/delete", {
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

  async function togglePublish(row: EventRow) {
    const res = await fetch("/api/admin/events/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...row,
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
        title="Admin — Events"
        subtitle="Create, edit, publish, unpublish, and remove events."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, location, slug..."
                className="w-full md:w-[360px] rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
              />

              <button
                onClick={load}
                className="rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800"
              >
                Refresh
              </button>

              <Link
                href="/admin/events/create"
                className="rounded-lg bg-fuchsia-600 px-5 py-3 text-white font-semibold hover:bg-fuchsia-700"
              >
                + New Event
              </Link>
            </div>
          </div>

          {err ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-8 overflow-hidden rounded-2xl border">
            <div className="bg-slate-50 px-5 py-4">
              <p className="font-semibold text-slate-900">
                Events ({visible.length})
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-600">Loading...</div>
            ) : visible.length === 0 ? (
              <div className="p-8 text-slate-600">No events found.</div>
            ) : (
              <div className="divide-y">
                {visible.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{row.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {row.event_date || "No date"}{" "}
                        {row.event_time ? `• ${row.event_time}` : ""}{" "}
                        {row.location ? `• ${row.location}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        slug: {row.slug} • {row.is_published ? "Published" : "Draft / Unpublished"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/admin/events/${row.id}`}
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
                        onClick={() => removeEvent(row.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                      {row.is_published ? (
                        <Link
                          href={`/events/${row.slug}`}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}