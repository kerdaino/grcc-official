"use client";

import { useEffect, useState } from "react";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

type ScheduleRow = {
  id: string;
  title: string;
  session_date: string;
  session_time: string | null;
  instructor: string | null;
  location: string | null;
  description: string | null;
};

export default function LMSSchedulePage() {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/lms/schedule/list", {
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

    load();
  }, []);

  return (
    <LMSLayout>
      <LMSHeader
        title="Course Schedule"
        subtitle="Track your class dates, topics, and important milestones."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading schedule...</p>
        ) : msg ? (
          <p className="text-red-700">{msg}</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-600">No schedule has been published yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border bg-slate-50 p-5">
                <h3 className="text-lg font-bold text-slate-900">{row.title}</h3>
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

                {row.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {row.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </LMSLayout>
  );
}