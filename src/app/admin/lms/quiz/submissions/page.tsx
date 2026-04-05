"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  score: number;
  total: number;
  created_at: string;
  sod_quizzes?: {
    title?: string;
  } | null;
  sod_students?: {
    full_name?: string;
    email?: string;
    cohort?: string;
  } | null;
};

export default function AdminLMSQuizSubmissionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/lms/quiz/submissions", {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load quiz submissions");
      setLoading(false);
      return;
    }

    setRows(data.rows || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return rows;

    return rows.filter((row) => {
      const name = row.sod_students?.full_name || "";
      const email = row.sod_students?.email || "";
      const quiz = row.sod_quizzes?.title || "";

      return (
        name.toLowerCase().includes(text) ||
        email.toLowerCase().includes(text) ||
        quiz.toLowerCase().includes(text)
      );
    });
  }, [rows, q]);

  return (
    <main>
      <PageHero
        title="Admin — Quiz Submissions"
        subtitle="View quiz scores and student submissions."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student name, email, or quiz title..."
              className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400 md:w-[420px]"
            />

            <button
              onClick={load}
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          {msg ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {msg}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border">
            <div className="bg-slate-50 px-5 py-4">
              <p className="font-semibold text-slate-900">
                Quiz Submissions ({filtered.length})
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-600">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-slate-600">No quiz submissions yet.</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b bg-white">
                    <tr className="text-sm text-slate-600">
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Quiz</th>
                      <th className="px-5 py-4">Cohort</th>
                      <th className="px-5 py-4">Score</th>
                      <th className="px-5 py-4">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id} className="border-b text-sm text-slate-700">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {row.sod_students?.full_name || "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.sod_students?.email || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">{row.sod_quizzes?.title || "—"}</td>
                        <td className="px-5 py-4">{row.sod_students?.cohort || "—"}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            {row.score}/{row.total}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}