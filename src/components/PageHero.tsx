// src/components/PageHero.tsx
// Reusable banner header for inner pages (matches the hero style but smaller)

import Link from "next/link";

export default function PageHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image?: string; // e.g. "/images/heroes/sod.jpg"
}) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background image (optional) */}
      {image ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      ) : null}

      {/* Dark overlay for readability */}
      <div
        className={`absolute inset-0 ${
          image
            ? "bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-slate-950/85"
            : "bg-slate-950"
        }`}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl bg-white/5 px-6 py-10 text-center text-white shadow-lg border border-white/10 backdrop-blur-sm">
          <p className="text-white/60 text-sm">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / {title}
          </p>

          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold">{title}</h1>

          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-white/80">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}