import Link from "next/link";
import PageHero from "@/components/PageHero";

const sermons = [
  { slug: "the-refiners-fire", title: "The Refiner’s Fire", date: "Feb 2026", preacher: "Pastor Arome Iduh" },
  { slug: "priesthood-day-27", title: "70 Days of Priesthood (Day 27)", date: "Feb 2026", preacher: "Pastor Arome Iduh" },
];

export default function SermonsPage() {
  return (
    <main>
      <PageHero title="Sermons" subtitle="Watch and download recent sermons." />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {sermons.map((s) => (
              <Link
                key={s.slug}
                href={`/sermons/${s.slug}`}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-slate-500">{s.date}</p>
                <h3 className="mt-2 font-extrabold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.preacher}</p>
                <p className="mt-4 text-teal-700 font-semibold">View Sermon →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
