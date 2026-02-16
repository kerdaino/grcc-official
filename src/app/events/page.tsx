import Link from "next/link";
import PageHero from "@/components/PageHero";

const events = [
  {
    slug: "sunday-worship-service",
    title: "Sunday Worship Service",
    date: "Sun • 10:00 AM",
    location: "5 Moses Somefun Street, Adekoya Estate, College Rd.",
  },
  {
    slug: "thursday-service",
    title: "Thursday Service",
    date: "Thu • 6:00 PM",
    location: "5 Moses Somefun Street, Adekoya Estate, College Rd.",
  },
];

export default function EventsPage() {
  return (
    <main>
      <PageHero title="Events" subtitle="See upcoming events and service gatherings." />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((e) => (
              <Link
                key={e.slug}
                href={`/events/${e.slug}`}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-slate-500">{e.date}</p>
                <h3 className="mt-2 font-extrabold text-slate-900">{e.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{e.location}</p>

                <p className="mt-5 font-semibold text-purple-700">View Details →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
