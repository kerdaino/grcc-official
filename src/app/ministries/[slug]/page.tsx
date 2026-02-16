import PageHero from "@/components/PageHero";
import Link from "next/link";

export default function MinistrySinglePage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <PageHero title="Ministry" subtitle={`Ministry: ${params.slug}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Ministry Title Here
            </h1>
            <p className="mt-2 text-slate-600">
              (Backend will load real ministry title + content later.)
            </p>

            <div className="mt-8 rounded-xl bg-slate-50 border p-6 text-slate-700 leading-relaxed">
              <p>
                This ministry description is placeholder. Paste real text for now
                so the page looks complete.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
              >
                Join a Ministry
              </Link>

              <Link
                href="/ministries"
                className="rounded-lg border border-slate-300 px-5 py-3 text-slate-900 font-semibold hover:bg-slate-50"
              >
                Back to Ministries
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
