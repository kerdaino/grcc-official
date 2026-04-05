"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useState } from "react";

type LiveRow = {
  id: string;
  title: string;
  zoom_link: string | null;
  meeting_id: string | null;
  passcode: string | null;
  instructions: string | null;
  is_live: boolean;
  is_published: boolean;
  created_at: string;
};

export default function AdminLMSLiveClassPage() {
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    zoom_link: "",
    meeting_id: "",
    passcode: "",
    instructions: "",
    is_live: false,
  });

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/lms/live-class/list", {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load live class settings");
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

    const res = await fetch("/api/admin/lms/live-class/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        is_published: true,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to create live class config");
      return;
    }

    setForm({
      title: "",
      zoom_link: "",
      meeting_id: "",
      passcode: "",
      instructions: "",
      is_live: false,
    });

    await load();
  }

  async function toggleLive(id: string, isLive: boolean) {
    const res = await fetch("/api/admin/lms/live-class/toggle-live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, is_live: !isLive }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Failed to update live status");
      return;
    }

    await load();
  }

  async function deleteItem(id: string) {
    const ok = confirm("Delete this live class config?");
    if (!ok) return;

    const res = await fetch("/api/admin/lms/live-class/delete", {
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
        title="Admin — LMS Live Class"
        subtitle="Manage current live Zoom session information for students."
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
                Add Live Class
              </h2>

              <form onSubmit={createItem} className="mt-5 space-y-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Session title"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={form.zoom_link}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, zoom_link: e.target.value }))
                  }
                  placeholder="Zoom link"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={form.meeting_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, meeting_id: e.target.value }))
                  }
                  placeholder="Meeting ID"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <input
                  value={form.passcode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, passcode: e.target.value }))
                  }
                  placeholder="Passcode"
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <textarea
                  value={form.instructions}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, instructions: e.target.value }))
                  }
                  placeholder="Instructions for students"
                  className="min-h-[120px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />

                <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={form.is_live}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, is_live: e.target.checked }))
                    }
                  />
                  Mark as live now
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Save Live Class
                </button>
              </form>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Live Class Configurations
              </h2>

              {loading ? (
                <p className="mt-4 text-slate-600">Loading...</p>
              ) : rows.length === 0 ? (
                <p className="mt-4 text-slate-600">No live class config yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {rows.map((row) => (
                    <div key={row.id} className="rounded-xl border bg-slate-50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {row.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            Status:{" "}
                            <span
                              className={
                                row.is_live
                                  ? "font-semibold text-emerald-700"
                                  : "font-semibold text-amber-700"
                              }
                            >
                              {row.is_live ? "Live" : "Not Live"}
                            </span>
                          </p>

                          {row.meeting_id ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Meeting ID: {row.meeting_id}
                            </p>
                          ) : null}

                          {row.passcode ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Passcode: {row.passcode}
                            </p>
                          ) : null}

                          {row.zoom_link ? (
                            <p className="mt-1 text-sm text-slate-600 break-all">
                              Link: {row.zoom_link}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleLive(row.id, row.is_live)}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            {row.is_live ? "Set Not Live" : "Set Live"}
                          </button>

                          <button
                            onClick={() => deleteItem(row.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {row.instructions ? (
                        <p className="mt-3 text-sm text-slate-700">
                          {row.instructions}
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