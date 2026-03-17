"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useMemo, useState } from "react";

type MinistryApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  reason: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminMinistriesPage() {
  const [rows, setRows] = useState<MinistryApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending"
  );

  async function load() {
    setLoading(true);
    setErr("");

    const res = await fetch("/api/admin/ministries/list", {
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setErr(data?.message || "Failed to load applications");
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

    return rows
      .filter((r) => (filter === "all" ? true : (r.status || "pending") === filter))
      .filter((r) => {
        if (!text) return true;

        return (
          (r.full_name || "").toLowerCase().includes(text) ||
          (r.email || "").toLowerCase().includes(text) ||
          (r.department || "").toLowerCase().includes(text) ||
          (r.phone || "").toLowerCase().includes(text)
        );
      });
  }, [rows, q, filter]);

  async function updateStatus(id: string, status: "approved" | "rejected" | "pending") {
    const res = await fetch("/api/admin/ministries/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.message || "Failed to update application");
      return;
    }

    await load();
  }

  return (
    <main>
      <PageHero
        title="Admin — Ministries"
        subtitle="Review ministry workforce applications and update their status."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, department, phone..."
                className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 md:w-[360px]"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>

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
                Applications ({visible.length})
              </p>
              <p className="text-sm text-slate-600">
                Review and manage ministry applications.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-600">Loading...</div>
            ) : visible.length === 0 ? (
              <div className="p-8 text-slate-600">No applications found.</div>
            ) : (
              <div className="divide-y">
                {visible.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-bold text-slate-900">
                          {row.full_name}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            (row.status || "pending") === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : (row.status || "pending") === "approved"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {row.status || "pending"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-700">
                        {row.email}
                        {row.phone ? ` • ${row.phone}` : ""}
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        Department: {row.department || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Applied: {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Reason for Joining
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {row.reason || "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 md:flex-col">
                      <button
                        onClick={() => updateStatus(row.id, "approved")}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(row.id, "rejected")}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => updateStatus(row.id, "pending")}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        Mark Pending
                      </button>
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