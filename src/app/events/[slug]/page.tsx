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
            className="font-semibold text-purple-700 hover:underline"
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
        image={event.image_url || "/images/events.jpg"}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="overflow-hidden rounded-2xl border bg-slate-50">
            {event.image_url ? (
              <div className="h-[320px] w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="p-8">
              <p className="text-slate-600">
                {event.event_date} • {event.event_time}
              </p>

              <p className="mt-2 font-semibold text-slate-700">
                {event.location}
              </p>

              {event.description ? (
                <div className="mt-6 whitespace-pre-wrap leading-relaxed text-slate-700">
                  {event.description}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
                >
                  Plan Your Visit
                </Link>

                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-900 hover:bg-white"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}