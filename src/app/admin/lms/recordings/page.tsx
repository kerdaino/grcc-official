"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type RecordingRow = {
  id: string;
  title: string;
  video_type: string | null;
  recording_url: string | null;
  embed_code: string | null;
  session_date: string | null;
  instructor: string | null;
  description: string | null;
  is_published: boolean;
};

export default function AdminLMSRecordingsPage() {
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    video_type: "url",
    recording_url: "",
    embed_code: "",
    session_date: "",
    instructor: "",
    description: "",
  });

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/lms/recordings/list", {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load recordings");
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

    const res = await fetch("/api/admin/lms/recordings/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, is_published: true }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to add recording");
      return;
    }

    setForm({
      title: "",
      video_type: "url",
      recording_url: "",
      embed_code: "",
      session_date: "",
      instructor: "",
      description: "",
    });

    await load();
  }

  async function deleteItem(id: string) {
    const ok = confirm("Delete this recording?");
    if (!ok) return;

    const res = await fetch("/api/admin/lms/recordings/delete", {
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
        title="Admin — LMS Recordings"
        subtitle="Manage School of Discovery class recordings."
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
                Add Recording
              </h2>

              <form onSubmit={createItem} className="mt-5 space-y-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Recording title"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <select
                  value={form.video_type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, video_type: e.target.value }))
                  }
                  className="w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="url">Video URL</option>
                  <option value="embed">Embed Code</option>
                </select>

                {form.video_type === "url" ? (
                  <input
                    value={form.recording_url}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, recording_url: e.target.value }))
                    }
                    placeholder="Recording URL"
                    className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                ) : (
                  <textarea
                    value={form.embed_code}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, embed_code: e.target.value }))
                    }
                    placeholder="Paste Vimeo or video embed code here"
                    className="min-h-[140px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                )}

                <input
                  type="date"
                  value={form.session_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, session_date: e.target.value }))
                  }
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
                  Add Recording
                </button>
              </form>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Recordings
              </h2>

              {loading ? (
                <p className="mt-4 text-slate-600">Loading...</p>
              ) : rows.length === 0 ? (
                <p className="mt-4 text-slate-600">No recordings yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {rows.map((row) => (
                    <div key={row.id} className="rounded-xl border bg-slate-50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {row.title}
                          </h3>

                          {row.session_date ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Date: {row.session_date}
                            </p>
                          ) : null}

                          {row.instructor ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Instructor: {row.instructor}
                            </p>
                          ) : null}

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            Type: {row.video_type === "embed" ? "Embed Code" : "Video URL"}
                          </p>

                          {row.video_type === "embed" ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Embedded video ready
                            </p>
                          ) : (
                            <p className="mt-1 break-all text-sm text-slate-600">
                              {row.recording_url || "—"}
                            </p>
                          )}
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