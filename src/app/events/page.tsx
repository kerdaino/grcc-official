import PageHero from "@/components/PageHero";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

type Event = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
};

export default async function EventsPage() {
  const { data, error } = await supabaseServer
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: true });

  const rows: Event[] = error ? [] : data || [];

  return (
    <main>
      <PageHero
        title="Events"
        subtitle="See upcoming events and service gatherings."
        image="/images/events.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">

          {rows.length === 0 ? (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
              No upcoming events yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {rows.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.slug}`}
                  className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <p className="text-sm text-slate-500">
                    {e.event_date || "—"} {e.event_time ? `• ${e.event_time}` : ""}
                  </p>

                  <h3 className="mt-2 font-extrabold text-slate-900">
                    {e.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-600">
                    {e.location || "Location not specified"}
                  </p>

                  <p className="mt-5 font-semibold text-purple-700">
                    View Details →
                  </p>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}