"use client";

export default function LMSHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-purple-700">GRCC School of Discovery</p>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h1>
      {subtitle ? (
        <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
      ) : null}
    </div>
  );
}