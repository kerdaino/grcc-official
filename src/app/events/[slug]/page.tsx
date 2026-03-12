import PageHero from "@/components/PageHero";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function EventSinglePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: event, error } = await supabaseServer
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!event || error) {
    return (
      <main>
        <PageHero
          title="Event Not Found"
          subtitle="This event may not be published yet."
          image="/images/events.jpg"
        />

        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Link
            href="/events"
            className="text-purple-700 font-semibold hover:underline"
          >
            ← Back to Events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        title={event.title}
        subtitle={`${event.event_date || ""} ${event.event_time || ""}`}
        image="/images/events.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">

          <div className="rounded-2xl border bg-slate-50 p-8">

            <p className="text-slate-600">
              {event.event_date} • {event.event_time}
            </p>

            <p className="mt-2 text-slate-700 font-semibold">
              {event.location}
            </p>

            {event.description ? (
              <div className="mt-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
              >
                Plan Your Visit
              </Link>

              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-5 py-3 text-slate-900 font-semibold hover:bg-white"
              >
                Get Directions
              </a>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}