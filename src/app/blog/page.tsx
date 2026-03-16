import Link from "next/link";
import PageHero from "@/components/PageHero";
import { supabaseServer } from "@/lib/supabaseServer";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  created_at: string;
};

export default async function BlogPage() {
  const { data, error } = await supabaseServer
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const posts: BlogPost[] = error ? [] : data || [];

  return (
    <main>
      <PageHero
        title="Blog"
        subtitle="Articles, updates, and ministry notes."
        image="/images/gallery3.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {posts.length === 0 ? (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
              No blog posts published yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="h-52 overflow-hidden bg-slate-100">
                    {p.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-500">
                        No Cover Image
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                      {p.author ? ` • ${p.author}` : ""}
                    </p>

                    <h3 className="mt-2 font-extrabold text-slate-900">
                      {p.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {p.excerpt || "Read this post for more details."}
                    </p>

                    <p className="mt-5 font-semibold text-teal-700">
                      Read More →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}