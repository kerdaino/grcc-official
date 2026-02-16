import PageHero from "@/components/PageHero";

export default function SermonSinglePage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <PageHero title="Sermon" subtitle={`Sermon: ${params.slug}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="rounded-2xl border bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Sermon Title Here</h2>
            <p className="mt-2 text-slate-600">Preacher • Date</p>

            <div className="mt-8 rounded-xl bg-black/5 p-6 text-slate-600">
              Video/Audio embed will go here later.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700">
                Watch
              </button>
              <button className="rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700">
                Download Audio
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
