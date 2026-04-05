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

export default function LMSDashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
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
      setLoading(false);
    }

    loadSession();
  }, []);

  async function logout() {
    await fetch("/api/lms/logout", { method: "POST" });
    window.location.href = "/lms/login";
  }

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