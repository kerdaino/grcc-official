"use client";

import { useEffect, useState } from "react";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";

type LiveRow = {
  id: string;
  title: string;
  zoom_link: string | null;
  meeting_id: string | null;
  passcode: string | null;
  instructions: string | null;
  is_live: boolean;
};

export default function LMSLiveClassPage() {
  const [row, setRow] = useState<LiveRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/lms/live-class/current", {
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Failed to load live class");
        setLoading(false);
        return;
      }

      setRow(data.row || null);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <LMSLayout>
      <LMSHeader
        title="Live Class"
        subtitle="Access your current Zoom session and class joining instructions here."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading live class...</p>
        ) : msg ? (
          <p className="text-red-700">{msg}</p>
        ) : !row ? (
          <p className="text-slate-600">No live class has been published yet.</p>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{row.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                Status:{" "}
                <span
                  className={
                    row.is_live
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-amber-700"
                  }
                >
                  {row.is_live ? "Live Now" : "Not Live Yet"}
                </span>
              </p>
            </div>

            {row.instructions ? (
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Instructions</p>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">
                  {row.instructions}
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Meeting ID</p>
                <p className="mt-2 text-slate-700">{row.meeting_id || "—"}</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Passcode</p>
                <p className="mt-2 text-slate-700">{row.passcode || "—"}</p>
              </div>
            </div>

            {row.zoom_link ? (
              <a
                href={row.zoom_link}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex rounded-xl px-5 py-3 font-semibold text-white ${
                  row.is_live
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {row.is_live ? "Join Live Class" : "Open Zoom Link"}
              </a>
            ) : (
              <p className="text-slate-600">Zoom link has not been added yet.</p>
            )}
          </div>
        )}
      </div>
    </LMSLayout>
  );
}