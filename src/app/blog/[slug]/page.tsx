import PageHero from "@/components/PageHero";

export default function BlogSinglePage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <PageHero title="Blog" subtitle={`Post: ${params.slug}`} />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <article className="rounded-2xl border bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Blog Post Title Here
            </h1>
            <p className="mt-2 text-slate-500 text-sm">Date • Author</p>

            <div className="prose prose-slate max-w-none mt-8">
              <p>
                (This is placeholder blog content. Later, backend will load real posts.)
              </p>
              <p>
                You can paste real content here for now to make it look complete.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
