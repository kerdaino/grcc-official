import PageHero from "@/components/PageHero";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import EventImageViewer from "./EventImageViewer";

export const dynamic = "force-dynamic";

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
                <div
                  key={e.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    {e.image_url ? (
                      <EventImageViewer
                        src={e.image_url}
                        alt={e.title}
                        containerClassName="h-full rounded-none"
                        imageClassName="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-500">
                        No Event Image
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-slate-500">
                      {e.event_date || "—"}
                      {e.event_time ? ` • ${e.event_time}` : ""}
                    </p>

                    <Link href={`/events/${e.slug}`} className="block">
                      <h3 className="mt-2 font-extrabold text-slate-900">
                        {e.title}
                      </h3>
                    </Link>

                    <p className="mt-3 text-sm text-slate-600">
                      {e.location || "Location not specified"}
                    </p>

                    <Link
                      href={`/events/${e.slug}`}
                      className="mt-5 inline-block font-semibold text-purple-700"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
