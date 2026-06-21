"use client";

import PageHero from "@/components/PageHero";
import { useEffect, useMemo, useState } from "react";

type ResultSubmission = {
  id: string;
  assessment_id: string | null;
  assessment_type: "quiz" | "final_exam";
  title: string;
  score: number;
  total: number;
  percentage: number;
  submitted_at: string | null;
};

type ResultRow = {
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
    cohort: string | null;
  };
  threshold_percentage: number;
  quiz_weight_percentage: number;
  final_exam_weight_percentage: number;
  quiz_average_percentage: number;
  final_exam_percentage: number;
  overall_percentage: number;
  certificate_type: string;
  eligible_for_completion_certificate: boolean;
  required_assessments_completed: boolean;
  required_quizzes_count: number;
  required_quizzes_completed_count: number;
  current_final_exam_completed: boolean;
  quiz_submissions_count: number;
  final_exam_submissions_count: number;
  submissions: ResultSubmission[];
  certificate: {
    certificate_code: string;
    certificate_type: string;
    verification_url: string | null;
  } | null;
};

function formatScore(submission?: ResultSubmission) {
  if (!submission) return "Not submitted";

  return `${submission.score}/${submission.total} (${submission.percentage}%)`;
}

function getCertificateStatus(row: ResultRow) {
  if (!row.required_assessments_completed) return "Pending";

  return row.eligible_for_completion_certificate ? "Completion" : "Participation";
}

function getStatusClass(status: string) {
  if (status === "Completion") return "bg-emerald-100 text-emerald-800";
  if (status === "Participation") return "bg-amber-100 text-amber-800";

  return "bg-slate-100 text-slate-700";
}

export default function AdminLMSResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"error" | "success">("error");
  const [q, setQ] = useState("");
  const [processingStudentId, setProcessingStudentId] = useState<string | null>(
    null
  );

  async function load() {
    setLoading(true);
    setMsg("");
    setMsgTone("error");

    const res = await fetch("/api/admin/lms/results/summary", {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to load LMS results");
      setMsgTone("error");
      setLoading(false);
      return;
    }

    setRows(data.rows || []);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function recalculateCertificate(studentId: string) {
    setProcessingStudentId(studentId);
    setMsg("");
    setMsgTone("error");

    const res = await fetch(
      "/api/admin/lms/results/recalculate-certificate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      }
    );
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to generate certificate");
      setMsgTone("error");
      setProcessingStudentId(null);
      return;
    }

    await load();
    setMsg("Certificate generated / recalculated successfully.");
    setMsgTone("success");
    setProcessingStudentId(null);
  }

  async function resetExamAttempt(row: ResultRow, submission: ResultSubmission) {
    const confirmed = confirm(
      `Reset the final exam attempt for ${
        row.student.full_name || row.student.email || "this student"
      }? This will delete only this student's final exam answers, submission, and generated certificate.`
    );

    if (!confirmed) return;

    const grantOverride = confirm(
      "If the final exam is no longer published/available, grant this student a 72-hour retake override?"
    );

    setProcessingStudentId(row.student.id);
    setMsg("");
    setMsgTone("error");

    const res = await fetch("/api/admin/lms/results/reset-exam-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: row.student.id,
        submission_id: submission.id,
        grant_override: grantOverride,
      }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Failed to reset final exam attempt");
      setMsgTone("error");
      setProcessingStudentId(null);
      return;
    }

    await load();
    setMsg(data.message || "Final exam attempt reset successfully.");
    setMsgTone("success");
    setProcessingStudentId(null);
  }

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return rows;

    return rows.filter((row) => {
      const name = row.student.full_name || "";
      const email = row.student.email || "";
      const cohort = row.student.cohort || "";
      const certificateType = row.certificate_type || "";

      return (
        name.toLowerCase().includes(text) ||
        email.toLowerCase().includes(text) ||
        cohort.toLowerCase().includes(text) ||
        certificateType.toLowerCase().includes(text)
      );
    });
  }, [rows, q]);

  return (
    <main>
      <PageHero
        title="Realms School of Discovery Admin"
        subtitle="View Realms School of Discovery results and certificates under Gloryrealm Christian Centre."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student name, email, cohort, or certificate type..."
              className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-slate-400 md:w-[480px]"
            />

            <button
              onClick={load}
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          {msg ? (
            <div
              className={`mb-6 rounded-lg border p-4 ${
                msgTone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {msg}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border">
            <div className="bg-slate-50 px-5 py-4">
              <p className="font-semibold text-slate-900">
                Realms School of Discovery Result & Certificate Overview ({filtered.length})
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Quiz/Test average is weighted at 60%; final exam is weighted at 40%.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-600">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-slate-600">No LMS results found.</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b bg-white">
                    <tr className="text-sm text-slate-600">
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Quiz/Test Average</th>
                      <th className="px-5 py-4">Final Exam Score</th>
                      <th className="px-5 py-4">Overall Score</th>
                      <th className="px-5 py-4">Eligibility</th>
                      <th className="px-5 py-4">Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const finalExam = row.submissions.find(
                        (submission) =>
                          submission.assessment_type === "final_exam"
                      );
                      const quizText = `${row.required_quizzes_completed_count}/${row.required_quizzes_count} required`;
                      const certificateReady = row.required_assessments_completed;
                      const status = getCertificateStatus(row);
                      const verificationUrl =
                        row.certificate?.verification_url ||
                        (row.certificate?.certificate_code
                          ? `/verify-certificate/${encodeURIComponent(row.certificate.certificate_code)}`
                          : null);

                      return (
                        <tr
                          key={row.student.id}
                          className="border-b align-top text-sm text-slate-700"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {row.student.full_name || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.student.email || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.student.cohort || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {row.quiz_average_percentage}%
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {quizText} • {row.quiz_weight_percentage}% weight
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.quiz_submissions_count} submitted
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {finalExam
                                ? `${row.final_exam_percentage}%`
                                : "Not submitted"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {row.current_final_exam_completed
                                ? "Submitted"
                                : "Pending"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatScore(finalExam)} • {row.final_exam_weight_percentage}% weight
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                              {certificateReady
                                ? `${row.overall_percentage}%`
                                : "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}
                            >
                              {status}
                            </span>
                            <p className="mt-2 text-xs text-slate-500">
                              {certificateReady
                                ? row.eligible_for_completion_certificate
                                  ? `Eligible for completion certificate (${row.threshold_percentage}%+)`
                                  : `Eligible for participation certificate (below ${row.threshold_percentage}%)`
                                : "Awaiting all required assessments"}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {certificateReady
                                ? row.certificate_type
                                : "Pending"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Code: {row.certificate?.certificate_code || "Not generated"}
                            </p>
                            {verificationUrl ? (
                              <a
                                href={verificationUrl}
                                target="_blank"
                                className="mt-3 inline-flex rounded-lg border px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                              >
                                View Certificate
                              </a>
                            ) : null}
                            <button
                              onClick={() =>
                                recalculateCertificate(row.student.id)
                              }
                              disabled={processingStudentId === row.student.id}
                              className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                            >
                              {processingStudentId === row.student.id
                                ? "Generating..."
                                : "Generate / Recalculate Certificate"}
                            </button>
                            {finalExam ? (
                              <button
                                onClick={() => resetExamAttempt(row, finalExam)}
                                disabled={
                                  processingStudentId === row.student.id
                                }
                                className="mt-3 inline-flex rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                              >
                                {processingStudentId === row.student.id
                                  ? "Processing..."
                                  : "Reset Exam Attempt"}
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
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
