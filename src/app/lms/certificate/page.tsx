"use client";

import LMSHeader from "@/components/lms/LMSHeader";
import LMSLayout from "@/components/lms/LMSLayout";
import { useEffect, useState } from "react";

type Certificate = {
  certificate_code: string;
  certificate_type: string;
  student_name: string;
  program_name: string;
  organization_name: string;
  overall_score: number;
  issued_at: string;
  admin_acknowledgement: string;
  verification_url: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function LMSCertificatePage() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadCertificate() {
      const res = await fetch("/api/lms/certificate", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Certificate pending");
        setLoading(false);
        return;
      }

      setCertificate(data.certificate);
      setLoading(false);
    }

    loadCertificate();
  }, []);

  return (
    <LMSLayout>
      <LMSHeader
        title="Certificate"
        subtitle="View and download your Realms School of Discovery certificate."
      />

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading certificate...</p>
        ) : msg ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            {msg}
          </div>
        ) : certificate ? (
          <div>
            <p className="text-sm font-semibold text-purple-700">
              {certificate.program_name}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              {certificate.certificate_type}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">Student</p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {certificate.student_name}
                </p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">
                  Certificate ID
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {certificate.certificate_code}
                </p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">
                  Overall Score
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {certificate.overall_score}%
                </p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-600">
                  Date Issued
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatDate(certificate.issued_at)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-600">
                Admin Acknowledgement
              </p>
              <p className="mt-2 text-slate-900">
                {certificate.admin_acknowledgement}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/lms/certificate/print"
                className="inline-flex justify-center rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
              >
                Open Printable Certificate
              </a>
              <a
                href="/api/lms/certificate/download"
                className="inline-flex justify-center rounded-xl border px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50"
              >
                Download PDF Certificate
              </a>
              {certificate.verification_url ? (
                <a
                  href={certificate.verification_url}
                  target="_blank"
                  className="inline-flex justify-center rounded-xl border px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Open Verification Page
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </LMSLayout>
  );
}
