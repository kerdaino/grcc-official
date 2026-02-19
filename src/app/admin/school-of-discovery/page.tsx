"use client";

// Admin dashboard: view School of Discovery applications + approve/reject.
// Protected by cookie set at /api/admin/login.

import PageHero from "@/components/PageHero";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  salvation_experience: string | null;
  church_attending: string | null;
  spiritual_covering: string | null;
  is_worker: string | null;
  expectation: string | null;
  attended_bible_school: string | null;
  disciple_of: string | null;
  status: string | null;
};

export default function AdminSODPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "admitted" | "rejected">(
    "pending"
  );

  async function load() {
    setLoading(true);
    setErr("");

    const res = await fetch("/api/admin/sod/list", { cache: "no-store" });
    const data = await res.json();

    if (!res.ok || !data.ok) {
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
      .filter((r) => (filter === "all" ? true : ((r.status || "pending").replaceAll("'", "")) === filter
))
      .filter((r) => {
        if (!text) return true;
        return (
          (r.name || "").toLowerCase().includes(text) ||
          (r.email || "").toLowerCase().includes(text) ||
          (r.address || "").toLowerCase().includes(text)
        );
      });
  }, [rows, q, filter]);

  async function decide(id: string, decision: "admitted" | "rejected") {
    const ok = confirm(`Are you sure you want to mark this applicant as ${decision}?`);
    if (!ok) return;

    const res = await fetch("/api/admin/sod/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert(data?.message || "Action failed");
      return;
    }

    await load();
    alert(`Updated: ${decision}`);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <main>
      <PageHero
        title="Admin — School of Discovery"
        subtitle="Review applications, set admission decision, and trigger emails."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, address..."
                className="w-full md:w-[360px] rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-lg border px-4 py-3 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="admitted">Admitted</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>

              <button
                onClick={load}
                className="rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

          {err ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between">
              <p className="font-semibold text-slate-900">
                Applications ({visible.length})
              </p>
              <p className="text-sm text-slate-500">
                Tip: click a row to read details below.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-600">Loading...</div>
            ) : visible.length === 0 ? (
              <div className="p-8 text-slate-600">No applications found.</div>
            ) : (
              <AdminTable rows={visible} onDecide={decide} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminTable({
  rows,
  onDecide,
}: {
  rows: Row[];
  onDecide: (id: string, decision: "admitted" | "rejected") => void;
}) {
  const [activeId, setActiveId] = useState<string>(rows[0]?.id);

  const active = useMemo(
    () => rows.find((r) => r.id === activeId) || rows[0],
    [rows, activeId]
  );

  return (
    <div className="grid md:grid-cols-2">
      {/* List */}
      <div className="border-b md:border-b-0 md:border-r">
        <div className="max-h-[520px] overflow-auto">
          {rows.map((r) => {
            const status = (r.status || "pending") as string;
            return (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`w-full text-left px-5 py-4 border-b hover:bg-slate-50 transition ${
                  r.id === active?.id ? "bg-slate-50" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-900">{r.name}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : status === "admitted"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {r.email || "No email"} • {r.address || "No address"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted: {new Date(r.created_at).toLocaleString()}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        <h3 className="text-xl font-extrabold text-slate-900">Applicant Details</h3>

        {!active ? (
          <p className="mt-4 text-slate-600">Select an application.</p>
        ) : (
          <>
            <div className="mt-5 grid gap-3 text-sm text-slate-700">
              <Detail label="Name" value={active.name} />
              <Detail label="Email" value={active.email || "—"} />
              <Detail label="Address / Country" value={active.address || "—"} />
              <Detail label="Date of Birth" value={active.date_of_birth || "—"} />
              <Detail label="Church Attending" value={active.church_attending || "—"} />
              <Detail label="Spiritual Covering" value={active.spiritual_covering || "—"} />
              <Detail label="Worker?" value={active.is_worker || "—"} />
              <Detail
                label="Attended Bible/Theology School Before?"
                value={active.attended_bible_school || "—"}
              />
              <Detail label="Who is a disciple?" value={active.disciple_of || "—"} />
            </div>

            <div className="mt-6">
              <p className="font-semibold text-slate-900">Salvation Experience</p>
              <div className="mt-2 rounded-lg border bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {active.salvation_experience || "—"}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold text-slate-900">Expectation</p>
              <div className="mt-2 rounded-lg border bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {active.expectation || "—"}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => onDecide(active.id, "admitted")}
                className="rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
              >
                Admit
              </button>

              <button
                onClick={() => onDecide(active.id, "rejected")}
                className="rounded-lg bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700"
              >
                Not Admitted
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Note: Until domain verification, decision emails may only deliver to the
              Resend account email. We also send a copy to ADMIN_NOTIFY_EMAIL.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}
