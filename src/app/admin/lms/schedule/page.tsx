"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type ScheduleRow = {
  id: string;
  title: string;
  session_date: string;
  session_time: string | null;
  instructor: string | null;
  location: string | null;
  description: string | null;
  is_published: boolean;
};

export default function AdminLMSSchedulePage() {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    session_date: "",
    session_time: "",
    instructor: "",
    location: "",
    description: "",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/lms/schedule/list", {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load schedule");
      setLoading(false);
      return;
    }

    setRows(data.rows || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/admin/lms/schedule/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create schedule item");
      return;
    }

    setForm({
      title: "",
      session_date: "",
      session_time: "",
      instructor: "",
      location: "",
      description: "",
    });

    await load();
  }

  async function deleteItem(id: string) {
    const ok = confirm("Delete this schedule item?");
    if (!ok) return;

    const res = await fetch("/api/admin/lms/schedule/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Delete failed");
      return;
    }

    await load();
  }

  return (
    <main>
      <PageHero
        title="Admin — LMS Schedule"
        subtitle="Manage School of Discovery class schedule."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {msg ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {msg}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Add Schedule Item
              </h2>

              <form onSubmit={createItem} className="mt-5 space-y-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Session title"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  type="date"
                  value={form.session_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, session_date: e.target.value }))
                  }
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={form.session_time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, session_time: e.target.value }))
                  }
                  placeholder="Time (e.g. 5:00 PM)"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={form.instructor}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, instructor: e.target.value }))
                  }
                  placeholder="Instructor"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="Location / Zoom"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Short description"
                  className="min-h-[120px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Add Schedule
                </button>
              </form>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Schedule Items
              </h2>

              {loading ? (
                <p className="mt-4 text-slate-600">Loading...</p>
              ) : rows.length === 0 ? (
                <p className="mt-4 text-slate-600">No schedule items yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {rows.map((row) => (
                    <div
                      key={row.id}
                      className="rounded-xl border bg-slate-50 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {row.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {row.session_date}
                            {row.session_time ? ` • ${row.session_time}` : ""}
                          </p>
                          {row.instructor ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Instructor: {row.instructor}
                            </p>
                          ) : null}
                          {row.location ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Location: {row.location}
                            </p>
                          ) : null}
                        </div>

                        <button
                          onClick={() => deleteItem(row.id)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>

                      {row.description ? (
                        <p className="mt-3 text-sm text-slate-700">
                          {row.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}