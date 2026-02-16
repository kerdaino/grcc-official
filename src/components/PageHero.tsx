// src/components/PageHero.tsx
// Reusable banner header for inner pages (matches the hero style but smaller)

import Link from "next/link";

export default function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl bg-white/5 px-6 py-10 text-center text-white shadow-lg border border-white/10">
          <p className="text-white/60 text-sm">
            <Link href="/" className="hover:text-white">Home</Link> / {title}
          </p>

          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold">{title}</h1>

          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-white/75">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
