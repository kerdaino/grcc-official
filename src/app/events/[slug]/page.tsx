import PageHero from "@/components/PageHero";
import Link from "next/link";

export default function EventSinglePage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <PageHero title="Event" subtitle={`Event: ${params.slug}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-2xl border bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Event Title Here</h2>
            <p className="mt-2 text-slate-600">Date • Time • Location</p>

            <div className="mt-6 text-slate-700 leading-relaxed">
              <p>
                (Event description will go here. Later, backend will supply this.)
              </p>
            </div>

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
