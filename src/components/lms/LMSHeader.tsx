"use client";

const REALMS_INSTITUTE_LOGO_PATH = "/images/logo4.png";

export default function LMSHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <img
          src={REALMS_INSTITUTE_LOGO_PATH}
          alt="Realms Institute logo"
          className="h-12 w-12 shrink-0 rounded-full object-contain"
        />
        <div>
          <p className="text-sm font-semibold text-purple-700">Realms Institute</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
