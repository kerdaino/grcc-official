"use client";

import { useState } from "react";

type GivingDetailsCardProps = {
  title: string;
  accountName: string;
  bank: string;
  accountNumber: string;
  swift?: string;
  routing?: string;
};

function CopyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 break-words text-base font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function GivingDetailsCard({
  title,
  accountName,
  bank,
  accountNumber,
  swift,
  routing,
}: GivingDetailsCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          Access Bank
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <CopyField label="Account Name" value={accountName} />
        <CopyField label="Bank" value={bank} />
        <CopyField label="Account Number" value={accountNumber} />
        {swift ? <CopyField label="Swift" value={swift} /> : null}
        {routing ? <CopyField label="Routing" value={routing} /> : null}
      </div>
    </div>
  );
}
