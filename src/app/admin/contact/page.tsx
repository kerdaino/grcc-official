"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useMemo, useState } from "react";

type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
};

export default function AdminContactPage() {
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const res = await fetch("/api/admin/contact/list", {
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setErr(data?.message || "Failed to load contact messages");
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
        (r.name || "").toLowerCase().includes(text) ||
        (r.email || "").toLowerCase().includes(text) ||
        (r.phone || "").toLowerCase().includes(text) ||
        (r.message || "").toLowerCase().includes(text)
      );
    });
  }, [rows, q]);

  return (
    <main>
      <PageHero
        title="Admin — Contact Messages"
        subtitle="View messages submitted through the website contact form."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, phone, message..."
                className="w-full md:w-[360px] rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />

              <button
                onClick={load}
                className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>

          {err ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-8 overflow-hidden rounded-2xl border">
            <div className="flex items-center justify-between bg-slate-50 px-5 py-4">
              <p className="font-semibold text-slate-900">
                Messages ({visible.length})
              </p>
              <p className="text-sm text-slate-600">
                Website contact submissions
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-600">Loading...</div>
            ) : visible.length === 0 ? (
              <div className="p-8 text-slate-600">No messages found.</div>
            ) : (
              <div className="divide-y">
                {visible.map((row) => (
                  <div key={row.id} className="grid gap-4 p-5 md:grid-cols-[1fr_1.4fr]">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {row.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">{row.email}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {row.phone || "No phone number"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Message
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {row.message}
                      </p>

                      <div className="mt-4">
                        <a
                          href={`mailto:${row.email}?subject=Re:%20Your%20message%20to%20GRCC`}
                          className="inline-flex rounded-lg border px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          Reply by Email
                        </a>
                      </div>
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