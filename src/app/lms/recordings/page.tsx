"use client";

import { useEffect, useState } from "react";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

type RecordingRow = {
  id: string;
  title: string;
  recording_url: string;
  session_date: string | null;
  instructor: string | null;
  description: string | null;
};

export default function LMSRecordingsPage() {
  const [rows, setRows] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/lms/recordings/list", {
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

    load();
  }, []);

  return (
    <LMSLayout>
      <LMSHeader
        title="Recordings"
        subtitle="Watch previous class recordings here."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading recordings...</p>
        ) : msg ? (
          <p className="text-red-700">{msg}</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-600">No recordings have been published yet.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border bg-slate-50 p-5">
                <h3 className="text-lg font-bold text-slate-900">{row.title}</h3>

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

                {row.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {row.description}
                  </p>
                ) : null}

                <a
                  href={row.recording_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Watch Recording
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </LMSLayout>
  );
}