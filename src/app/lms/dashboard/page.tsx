"use client";

import { useEffect, useState } from "react";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

type Student = {
  id: string;
  full_name: string;
  email: string;
  cohort: string | null;
  status: string | null;
  payment_status: string | null;
  access_enabled: boolean;
};

type ResultSubmission = {
  assessment_type: "quiz" | "final_exam";
  title: string;
  score: number;
  total: number;
  percentage: number;
  submitted_at: string | null;
};

type ResultSummary = {
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
};

export default function LMSDashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);
  const [resultLoading, setResultLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const res = await fetch("/api/lms/session", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.authenticated) {
        window.location.href = "/lms/login";
        return;
      }

      setStudent(data.student);

      const resultRes = await fetch("/api/lms/results/summary", {
        cache: "no-store",
      });
      const resultData = await resultRes.json().catch(() => null);

      if (resultRes.ok && resultData?.summary) {
        setResultSummary(resultData.summary);
      }

      setResultLoading(false);
      setLoading(false);
    }

    loadSession();
  }, []);

  async function logout() {
    await fetch("/api/lms/logout", { method: "POST" });
    window.location.href = "/lms/login";
  }

  const finalExamSubmission = resultSummary?.submissions.find(
    (submission) => submission.assessment_type === "final_exam"
  );
  const hasCompletedRequiredAssessments =
    resultSummary?.required_assessments_completed === true;
  const certificateStatus = hasCompletedRequiredAssessments
    ? resultSummary?.certificate_type
    : "Pending";
  const pendingItems = [
    resultSummary &&
    resultSummary.required_quizzes_completed_count <
      resultSummary.required_quizzes_count
      ? `${resultSummary.required_quizzes_count - resultSummary.required_quizzes_completed_count} quiz/test${resultSummary.required_quizzes_count - resultSummary.required_quizzes_completed_count === 1 ? "" : "s"}`
      : null,
    !resultSummary?.current_final_exam_completed ? "final exam" : null,
  ].filter(Boolean);
  const pendingMessage =
    pendingItems.length > 0
      ? `Complete your remaining ${pendingItems.join(" and ")} to unlock your certificate.`
      : "Your certificate is pending until all required assessments are confirmed.";
  const certificateTone = hasCompletedRequiredAssessments
    ? resultSummary?.eligible_for_completion_certificate
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800"
    : "border-slate-200 bg-slate-50 text-slate-700";

  if (loading) {
    return (
      <LMSLayout>
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-700">
          Loading dashboard...
        </div>
      </LMSLayout>
    );
  }

  return (
    <LMSLayout>
      <LMSHeader
        title={`Welcome, ${student?.full_name || "Student"}`}
        subtitle="This is your learning dashboard. Here you will find your class schedule, live session links, recordings, quizzes, and final exam."
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">Cohort</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900">
            {student?.cohort || "Cohort 1"}
          </h3>
          <p className="mt-2 text-slate-600">Orientation & Matriculation begins April 8.</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">Class Start Date</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900">April 10, 2026</h3>
          <p className="mt-2 text-slate-600">Ensure you are prepared and present for the first session.</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-purple-700">Access Status</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900">
            {student?.access_enabled ? "Active" : "Pending"}
          </h3>
          <p className="mt-2 text-slate-600">Your LMS access status.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-700">
              Realms Institute Result & Certificate
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-slate-900">
              {resultLoading
                ? "Loading result status..."
                : certificateStatus}
            </h2>
          </div>

          {!resultLoading ? (
            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-semibold ${certificateTone}`}
            >
              {certificateStatus}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Realms School of Discovery under Gloryrealm Christian Centre.
        </p>

        {resultLoading ? (
          <p className="mt-4 text-slate-600">Checking submitted assessments...</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-600">
                Overall Score
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {hasCompletedRequiredAssessments && resultSummary
                  ? `${resultSummary.overall_percentage}%`
                  : "Pending"}
              </p>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-600">
                Quizzes/Tests Completed
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {resultSummary?.quiz_submissions_count || 0}
              </p>
              {resultSummary?.required_quizzes_count ? (
                <p className="mt-1 text-sm text-slate-600">
                  {resultSummary.required_quizzes_completed_count}/
                  {resultSummary.required_quizzes_count} required
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-600">
                Final Exam Score
              </p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {resultSummary?.current_final_exam_completed
                  ? "Submitted"
                  : "Pending"}
              </p>
              {finalExamSubmission ? (
                <p className="mt-1 text-sm text-slate-600">
                  Score recorded
                </p>
              ) : null}
            </div>
          </div>
        )}

        {!resultLoading && hasCompletedRequiredAssessments ? (
          <a
            href="/api/lms/certificate/download"
            className="mt-5 inline-flex rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
          >
            Download Certificate
          </a>
        ) : !resultLoading ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {pendingMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Quick Access</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href="/lms/schedule" className="rounded-xl border bg-slate-50 px-4 py-4 font-semibold text-slate-900 hover:bg-slate-100">
              Course Schedule
            </a>
            <a href="/lms/live-class" className="rounded-xl border bg-slate-50 px-4 py-4 font-semibold text-slate-900 hover:bg-slate-100">
              Join Live Class
            </a>
            <a href="/lms/recordings" className="rounded-xl border bg-slate-50 px-4 py-4 font-semibold text-slate-900 hover:bg-slate-100">
              Watch Recordings
            </a>
            <a href="/lms/quiz" className="rounded-xl border bg-slate-50 px-4 py-4 font-semibold text-slate-900 hover:bg-slate-100">
              Take Quiz
            </a>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Announcements</h2>
          <div className="mt-4 rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Orientation & Matriculation</p>
            <p className="mt-2 text-slate-600">
              Orientation and matriculation is scheduled for April 8. LMS login details will be sent on or before that date.
            </p>
          </div>

          <button
            onClick={logout}
            className="mt-5 rounded-xl border px-4 py-3 font-semibold text-slate-900 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </LMSLayout>
  );
}
